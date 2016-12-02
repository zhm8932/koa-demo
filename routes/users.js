var router = require('koa-router')();

router.get('/', function *(next) {
  // this.body = 'this a users response!';
  yield this.render('user',{
    title:"用户列表",
    data:'user'
  })
});
router.get('/:id', function *(next) {
  // this.body = 'this a users response!';
  yield this.render('user',{
    title:"用户列表",
    data:'user'
  })
});

module.exports = router;
