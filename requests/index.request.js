var api = require('../utils/api');
var httpReq = require('../utils/http-request');
var proxy = require('../utils/proxy');
var request = require('koa-request');

console.log("httpReq:",httpReq)
//获取商品栏目
exports.get_goods_category = function*(next){
    var self = this;
    var bizParam = {"id": "1607041613071684348"};
    console.log("bizParam:",bizParam)

    var options = {
        url: 'https://api.github.com/repos/dionoid/koa-request',
        headers: { 'User-Agent': 'request' }
    };

    var response = yield request(options); //Yay, HTTP requests with no callbacks!
    var info = JSON.parse(response.body);
    console.log("info：",info)


    this.state.info = info;
    // console.log("goods_category333:",this);
    // console.log("ctx:",ctx)
    var req = this.req;
    var res = this.res;
    // var req = this.request;
    // var res = this.response;
    // this.body = "hello ";
    // yield httpReq.ajax('GET',api.ArticleDetail,req,res,bizParam,function(err,data) {
    console.log("111")
    // yield httpReq.ajax('GET',api.ArticleDetail,bizParam,function(err,data) {
    //     console.log("22222:")
    //     console.log("goods_category:",data)
    //     // console.log("goods_category444:",res,req,next)
    //     // console.log("goods_category444:",self)
    //     var json = JSON.parse(data);
    //     // console.log("self:",self)
    //     self.state.data = data;
    //
    //     if(json) {
    //         // req.get_goods_category = json
    //         // res.locals.get_goods_category_success = req.get_goods_category_success= !err
    //     }
    //
    // });

    console.log("333333333333333333333333333:")
    // console.log("data:",data)
    // self.body = 'Hello World';
    yield next
}