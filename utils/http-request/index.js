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
var http= require('http');
var config = require('../config');
var sysParam = require('./sysParam');
var BufferHelper = require('./bufferhelper');//处理buffer接收问题
var errorHandler = require('./errorHandler');//处理错误

// console.log("sysParam:",sysParam)
// module.exports.ajax = function (method,apiName,browserReq,browserRes,bizParam,callback) {
module.exports.ajax = function*(method,apiName,bizParam,callback) {

    console.log("ajax111:")
    console.log("Promise:",Promise)

    var promise = new Promise(function(resolve, reject) {
        console.log('Promise:',fetch);
        resolve();
    });

    promise.then(function() {
        console.log('Resolved.');
    });

    console.log('Hi!');

    var method = method.toUpperCase();

    // var accessToken = (browserReq && browserReq.session && browserReq.session.userInfo && browserReq.session.userInfo.accessToken) || '11';
    var accessToken = '11';

    console.log("accessToken:",accessToken)
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
    console.log("url:",url)
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
        console.log("ajax222:")
        // var req = http.request(options,function(response) {
        var req = http.request(options,function(response) {

            var bufferHelper = new BufferHelper();

            response.on('data', function (chunk) {
                bufferHelper.concat(chunk);
            }).on('end',function() {

                var body = bufferHelper.toBuffer().toString('utf-8');

                console.log("body:",body);

                var resObj = null;
                console.log("ajax3333333333333:")
                // return body;

                try {
                    resObj = JSON.parse(body);
                    if(!resObj.success){
                        var err = new Error(resObj.msg);
                        err.serverCode = resObj.code;
                        handleError(resObj.code,err,body,true);
                    }else{
                        console.log("body2:",body)
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
                console.log("111")
                return  errorHandler.handleServerError(browserRes,code,err);
            }else{
                console.log("222222")
                return errorHandler.handleError(browserRes,code,err);
            }
        }
        callback && callback(err,data);
    }
};
