var router = require('koa-router')();
// var httpReq = require('../utils/http-request');
var Request = require('../requests/index.request');

router.get('/',Request.get_goods_category,function *(next) {
  console.log("render:渲染内容")
  console.log("datadata:",this.state)
  yield this.render('index', {
    title: 'Hello World Koa!',
    data: { foo: 'bar' }
  });
});

module.exports = router;
