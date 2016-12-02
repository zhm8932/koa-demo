
var config = require('../config');
var signParam = require('./signParam'); //参数签名加密模块

/*
 * 获取系统参数的排序
 * @param apiName {String}  API名称
 * @param bizParam {Object}  业务参数
 * @param accessToken {String} session值
 * */
module.exports = function (apiName,bizParam,accessToken) {
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

    sysParameters.sign = signParam(sysParameters,bizParam);  //签名加密

    return JSON.stringify(sysParameters);
}