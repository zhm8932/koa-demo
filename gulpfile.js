const gulp = require('gulp'),
    browserSync = require('browser-sync'),   //自动刷新浏览器
    reload = browserSync.reload,
    sass = require('gulp-sass'),             //sass编译
    minifycss = require('gulp-minify-css'),  //css压缩
    autoprefixer = require('gulp-autoprefixer'), //处理浏览器的css兼容性
    clean = require('gulp-clean'),           //删除文件
    gutil = require('gulp-util'),
    nodemon = require('gulp-nodemon'),
    webpack = require('webpack'),
    webpackConfig = require('./webpack.config.js'),
    webpackDllConfig = require('./webpack.dll.config.js');

const PATHS = {
    sass:'clients/sass/**/*.scss',
    clientJs:'clients/js/**/*.js',
    clientJsx:'clients/js/**/*.jsx',
    html:'public/**/*.html',
    views:'views/**/*.jade',
    js:'public/js/**/*.js',
    css:'public/css**/*.css',
    webpackConfig:'webpack.config.js'
};

// scss编译后的css将注入到浏览器里实现更新
gulp.task('sass',function () {
    return gulp.src(PATHS.sass)
        .pipe(sass().on('error',sass.logError))
        .pipe(autoprefixer())
        .pipe(gulp.dest('public/css'))
        .pipe(reload({stream:true}))
})

//css压缩；
gulp.task('cssmin',function () {
    return gulp.src(PATHS.sass)
        .pipe(sass().on('error',sass.logError))
        .pipe(autoprefixer())
        .pipe(minifycss({
            keepSpecialComments:'*'  ////保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
        }))
        .pipe(gulp.dest('public/css'))

})

//清空css,js;
gulp.task('clean',function () {
    gulp.src([PATHS.js,PATHS.css],{read:false})
        .pipe(clean())
})

//dev server
//启动express 并添加browserSync支持
gulp.task('express:server',function (cb) {

    var called = false;
    nodemon({
        script:'./bin/www',  //启动node服务！！
        ignore:['.idea','node_modules'],
        env: { 'NODE_ENV': 'development' }
    }).on('start',function () {
        console.log('started!');
        if (!called){
            cb();
            called = true;
        }
    }).on('restart', function () {
        console.log('restarted!')
    })
})

//使用DllPlugin,单独打包使用的公共文件，
gulp.task("webpack:dll", function(callback) {
    var myConfig = Object.create(webpackDllConfig);
    webpack(myConfig,function (err,stats) {
        if(err) throw new gutil.PluginError('webpack:dll',err)
        gutil.log('[webpack:dll]',stats.toString({
            colors:true,
            hash: true,
            chunks: true,
            children: true,
            progress:true
        }));
        callback();
    })
});


//js文件打包
gulp.task("webpack", function(callback) {
    console.log("webpackConfig")
    var myConfig = Object.create(webpackConfig);
    webpack(myConfig,function (err,stats) {
        if(err) throw new gutil.PluginError('webpack',err)
        gutil.log('[webpack]',stats.toString({
            colors:true,
            hash: false,
            chunks: false,
            children: false,
            progress:true
        }));
        callback();
    })
});

//browserSync静态服务器
gulp.task('browser:server',function () {
    browserSync.init({
        open: false,  //停止自动打开浏览器
        proxy: "http://localhost:3001",  //访问http://localhost:4001/
        port: 4000,
        // server:{
        //     baseDir:"./dist"
        // }
    })
});

//webpack打包监控js
gulp.task('watch',function () {
    gulp.watch(PATHS.sass,['sass']);
    gulp.watch(PATHS.webpackConfig,['webpack']);

    // gulp.watch([PATHS.clientJs,PATHS.clientJsx],webpackDevelopment);
    gulp.watch([PATHS.clientJs,PATHS.clientJsx],['webpack']);                //webpackDev 任务监控文件打包速度 在100ms左右 ,页面第一次修改时不会自动刷新
    gulp.watch(PATHS.js).on('change',reload);
    gulp.watch(PATHS.views).on('change',reload);
})


gulp.task('dll',['webpack:dll']);
gulp.task('default',['browser:server','sass','webpack','watch']);
// gulp.task('default',['browser:server','sass','webpack','express:server','watch']);