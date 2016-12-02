const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
        vendors: ['react', 'react-dom','moment','jquery']
    },
    output: {
        path: path.join(__dirname, 'public','js'),
        filename: '[name].js',
        /**
         * output.library
         * 将会定义为 window.${output.library}
         * 在这次的例子中，将会定义为`window.vendor_library`
         */
        library: '[name]'
    },
    resolve:{
        extensions:["",".js",".jsx",".json"],
        //配置别名，在项目中可缩减引用路径
        alias:{
            jquery:'jquery/dist/jquery.min.js',
            // react:'react/dist/react.min.js',
            'react-dom':'react-dom/dist/react-dom.min.js',  //这里出现问题一：require('react-addons-css-transition-group')找不出文件，所以注释掉了，出现问题二
            moment:'moment/min/moment-with-locales.min.js'
        }
    },
    plugins: [
        //压缩打包的文件
        new webpack.optimize.UglifyJsPlugin({
            mangle: { //这里是不会被混淆压缩
                except: ['$', 'exports', 'require']
            },
            compress: {
                //supresses warnings, usually from module minification
                warnings: false
            }
        }),
        // new webpack.DefinePlugin({  //问题二，添加该处设置（后来验证，不是这里的原因，而是在webapck.config.js中不设置react的别名）
        //     "process.env": {
        //         NODE_ENV: JSON.stringify("production")
        //     }
        // }),
        new webpack.DllPlugin({
            /**
             * path
             * 定义 manifest 文件生成的位置
             * [name]的部分由entry的名字替换
             */
            path: path.join(__dirname,'[name]-manifest.json'),
            /**
             * name
             * dll bundle 输出到那个全局变量上
             * 和 output.library 一样即可。
             */
            name: '[name]',
            context: __dirname
        })
    ]
};