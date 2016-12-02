/**
 * Created by James on 16/4/8.
 */
var http = require('http');
var config = require('../config');
var md5 = require("blueimp-md5");
var request = require("request");
var BufferHelper = require('./bufferhelper');//处理buffer接收问题
var errorHandler = require('./errorHandler');//处理错误
// const logUtil = require('./logFactory');
// const routerLog = logUtil.getLogger('router');

var errorJson = {"code":"111","data":null,"msg":"json parse exception","serverCode":"","success":false};

function signParam(sysParam,bizParam) {
    var params = {};//把bizParam和sysParam一起存放到params里
    var propertyArr = [];//用来给属性名称排序
    var paramsArr = [];//用来存放排好序的属性名和属性值
    extend(params,sysParam,bizParam);

    //给属性名排序
    for(var property in params){
        propertyArr.push(property);
    }
    propertyArr.sort();

    //拼接属性名和属性值
    for(var i = 0; i <propertyArr.length; i++){
        //为json或数组时,要stringify
        if((typeof(params[propertyArr[i]]) == "object" && Object.prototype.toString.call(params[propertyArr[i]]).toLowerCase() == "[object object]" && !params[propertyArr[i]].length)|| Array.isArray(params[propertyArr[i]])){
            paramsArr.push(propertyArr[i] + JSON.stringify(params[propertyArr[i]]));
        }else{
            paramsArr.push(propertyArr[i] + params[propertyArr[i]]);
        }
    }

    var str =  config.secret + paramsArr.join('') + config.secret;

    var sign = md5(str);

    console.log('signParam--->origin:'+ str + '---sign--->' + sign);

    return md5(str);

};

function sysParam(apiName,bizParam,accessToken) {

    var timestamp = Date.now();

    var appKey = config.appKey;

    var version = config.v;

    var format = config.format;

    var sysParameters = {
        "timestamp" : timestamp,
        "v" : version,
        "format" : format,
        "appKey" : appKey,
        "apiName" : apiName,
        "session":accessToken || '11'
    };

    sysParameters.sign = signParam(sysParameters,bizParam);

    return JSON.stringify(sysParameters);
}

/**
 * 向[JAVA]服务器发起请求的公共方法
 * 如果出现错误,该方法默认直接处理。如不需处理,则把客户端请求req的属性autoHandleError设为false
 * 默认处理错误需设置客户端请求req的属性resType:'html'或'json'。默认为json
 * @param method http方法:DELETE、PUT、GET、POST
 * @param apiName 接口名称
 * @param browserReq 客户端请求
 * @param browserRes 客户端响应
 * @param bizParam 业务参数
 * @param callback 请求后的回调方法
 */
module.exports.ajax = function (method,apiName,browserReq,browserRes,bizParam,callback) {

    var method = method.toUpperCase();

    var accessToken = (browserReq && browserReq.session && browserReq.session.userInfo && browserReq.session.userInfo.accessToken) || '11';

    var sysPara = sysParam(apiName,bizParam,accessToken);
    var param = encodeURI('bizParam=' + encodeURIComponent(JSON.stringify(bizParam))+'&sysParam=' + sysPara);

    var path = config.path;

    // routerLog.info('method:'+method+'\n\t'+'bizParam:'+JSON.stringify(bizParam)+'\n\t'+'sysPara:'+sysPara);
    console.log('---method:'+method);
    console.log('---bizParam:'+JSON.stringify(bizParam));
    console.log('---sysPara:'+sysPara);

    if(method == 'GET') {
        path += '?' + param;
    }

    var url = 'http://' + config.hostname_test + ":" + config.port_test ;
    console.log(url);
    var options = {
        hostname : config.hostname_test,
        port : config.port_test,
        path : path,
        method : method,
        headers:{
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8;',
            'enctype':'application/x-www-form-urlencoded',
            'accept-encoding':'gzip'
        }
    };

    if(method == 'DELETE') {
        request({
            uri: {
                protocol:'http:',
                hostname : config.hostname_test,
                port : config.port_test,
                path : path
            },
            method: "DELETE",
            form: {
                bizParam: JSON.stringify(bizParam),
                sysParam: sysPara
            },
            header:{
                'Content-Type': 'application/x-www-form-urlencoded',
                'enctype':'application/x-www-form-urlencoded'
            }
        }, function(err, response, body) {

            console.log("body:",body);

            var resObj = null;

            if (err) {
                // console.log('problem with request: ' + err);
                errorJson.msg = err.message;
                return handleError('500',err,JSON.stringify(errorJson));
            }else {
                try {
                    resObj = JSON.parse(body);
                    if(!resObj.success){
                        var err = new Error(resObj.msg);
                        err.serverCode = resObj.code;
                        handleError(resObj.code,err,body,true);
                    }else{
                        callback && callback(null,body);
                    }

                }catch (err) {
                    handleError('500',err,body);
                }
            }

        });

    }else {
        var req = http.request(options,function(response) {

            var bufferHelper = new BufferHelper();

            response.on('data', function (chunk) {
                bufferHelper.concat(chunk);
            }).on('end',function() {

                var body = bufferHelper.toBuffer().toString('utf-8');

                console.log(body);

                var resObj = null;

                try {
                    resObj = JSON.parse(body);
                    if(!resObj.success){
                        var err = new Error(resObj.msg);
                        err.serverCode = resObj.code;
                        handleError(resObj.code,err,body,true);
                    }else{
                        callback && callback(null,body);
                    }

                }catch (err) {
                    handleError('500',err,body);
                }
            });

        }).on('error', function (err) {
            // console.log('problem with request: ',err);
            errorJson.msg = err.message;
            return handleError('500',err,JSON.stringify(errorJson));
        });

        if(method != 'GET') {req.write(param);}

        //console.log(req);
        req.end();

    }

    function handleError(code,err,data,serverError){
        browserReq.autoHandleError = browserReq.autoHandleError != false;//不为false时都赋值为true
        if(browserReq.autoHandleError){
            if(serverError){
                return  errorHandler.handleServerError(browserRes,code,err);
            }else{
                return errorHandler.handleError(browserRes,code,err);
            }
        }
        callback && callback(err,data);
    }
};




function extend() {
    var src, copyIsArray, copy, name, options, clone,
        target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        deep = false;
    // Handle a deep copy situation
    if ( typeof target === "boolean" ) {
        deep = target;
        // skip the boolean and the target
        target = arguments[ i ] || {};
        i++;
    }
    // Handle case when target is a string or something (possible in deep copy)
    if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
        target = {};
    }
    // extend jQuery itself if only one argument is passed
    if ( i === length ) {
        target = this;
        i--;
    }
    for ( ; i < length; i++ ) {
        // Only deal with non-null/undefined values
        if ( (options = arguments[ i ]) != null ) {
            // Extend the base object
            for ( name in options ) {
                src = target[ name ];
                copy = options[ name ];
                // Prevent never-ending loop
                if ( target === copy ) {
                    continue;
                }
                target[ name ] = copy;
            }
        }
    }
    // Return the modified object
    // console.log('target:',target)
    return target;
}