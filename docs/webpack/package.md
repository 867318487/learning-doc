# webpack 基础
## webpack 安装
安装本地的webpack

```
webpack webpack-cli -D //安装命令
npx webpack  //执行命令
```
webpack可以进行0配置
- 打包工具 -> 输出后的结果（js模块）
- 打包（支持我们的js模块化）

手动配置webpack
- 默认的配置文件` webpack.config.js`

```
let path = require('path')
module.exports={
    mode:'development',//模式 默认两种  production development
    entry:'./src/index.js',//入口
    output:{
        filename:'bundle.js',//打包后的文件名
        path:path.resolve(__dirname,'dist'), //由当前目录产生出来一个dist绝对路径，打包后的文件放在该目录下（要求：路径必须是一个绝对路径）
    }
}
```
将打包后的bundle.js引入到html中就可以正常运行

修改默认的配置文件

```
"scripts": {
    "bundle": "webpack"  //执行默认的配置文件
    "build":"webpack --config webpack.config.my.js"  //执行自定义的配置文件
  },
```
参考文章
- [深入浅出webpack](http://www.xbhub.com/wiki/webpack)
- [项目不知道如何做性能优化？不妨试一下代码分割](https://juejin.im/post/6844904101134729229)
- [Vue 首屏加载速度优化-这篇就够了](https://blog.csdn.net/weixin_42604828/article/details/93324751)
- [vue项目首屏加载优化实战](https://www.cnblogs.com/mianbaodaxia/p/10751453.html)
