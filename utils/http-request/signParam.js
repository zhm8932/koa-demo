var config = require('../config');
var extend = require('./extend');  //继承拷贝
var md5 = require("blueimp-md5");


module.exports = function(sysParam,bizParam) {
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

    // console.log('signParam--->origin:'+ str + '---sign--->' + sign);

    return md5(str);

};