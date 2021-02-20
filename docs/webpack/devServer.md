# devServer
## 安装配置
安装webpack-dev-server
```
//安装
npm install webpack-dev-server -D

```
webpack文件配置devserver

```
//在webpack.config.js中配置
module.exports={
    devServer:{//开发服务器的配置
        port:3000,               //指定运行的端口号
        progress:true,           //显示打包的进度条
        contentBase:'./build',   //打开指定目录
        compress:true,           //启动压缩
    },
}
```
## 启动
启动webpack-dev-server有2种方式：
- 通过cmd line
- 通过Node.js API

方式一：在cmd直接运行
```
//运行
npx webpack-dev-server // ==> Project is running at http://localhost:8080/   运行后只加载到根目录
```
输出结果
```
➜  webpack-code-splitting-demo-code-splitting npx webpack-dev-server
Project is running at http://localhost:8080/
webpack output is served from /
404s will fallback to /index.html
```

方式二：在package.json中配置

```
"scripts": {
    "dev":"webpack-dev-server"
  },
```
```
npm run dev //运行
```

## 其他配置项
### contentBase
devServer.contentBase 配置 DevServer HTTP 服务器的文件根目录。 默认情况下为当前执行目录，通常是项目根目录，所有一般情况下你不必设置它，除非你有额外的文件需要被 DevServer 服务。

cmd
```
webpack-dev-server --content-base ./dist
```
配置文件

```
//在webpack.config.js中配置
module.exports={
    devServer:{//开发服务器的配置
        contentBase:'./build',   //打开指定目录
    },
}
```
以上任选一种方式

输出结果
```
➜  webpack-code-splitting-demo-code-splitting npx webpack-dev-server --content-base ./dist
Project is running at http://localhost:8080/
webpack output is served from /
Content not from webpack is served from /Users/wanghan/实战/webpack打包练习/webpack-code-splitting-demo-code-splitting/dist
404s will fallback to /index.html
```

### 自动刷新
webpack-dev-server支持2种自动刷新的方式：
- Iframe mode
- inline mode

DevServer 的实时预览功能==依赖一个注入到页面里的代理客户端去接受来自 DevServer 的命令和负责刷新网页的工作。==
Iframe mode和Inline mode最后达到的效果都是一样的，都是监听文件的变化，然后再将编译后的文件推送到前端，完成页面的reload的。

#### inline
 devServer.inline 用于配置是否自动注入这个代理客户端到将运行在页面里的 Chunk 里去，默认是会自动注入。如果开启 inline，DevServer 会在构建完变化后的代码时通过代理客户端控制网页刷新。
使用inline mode的时候，cmd line需要写成：
```
webpack-dev-server --inline
```
访问地址
```
localhost:8080/index.html
```
输出结果
```
➜  webpack-code-splitting-demo-code-splitting npx webpack-dev-server --inline
Project is running at http://localhost:8080/
webpack output is served from /
404s will fallback to /index.html
```
#### iframe
通过 iframe 的方式去运行要开发的网页，当构建完变化后的代码时通过刷新 iframe 来实现实时预览。 但这时你需要去 `http://localhost:8080/webpack-dev-server/` 实时预览你的网页了。Iframe mode是在网页中嵌入了一个iframe，将我们自己的应用注入到这个iframe当中去，因此每次你修改的文件后，都是这个iframe进行了reload。（原理不理解）

使用iframe访问时

```
//在webpack.config.js中配置
module.exports={
    devServer:{//开发服务器的配置
        inline:false,  //关闭line，默认开启iframe
    },
}
```
访问地址
```
localhost:8080/webpack-dev-server/
```
输出结果
```
➜  webpack-code-splitting-demo-code-splitting npx webpack-dev-server
Project is running at http://localhost:8080/webpack-dev-server/
webpack output is served from /
404s will fallback to /index.html
```
### hot
devServer.hot 配置是否启用模块热替换功能。 DevServer 默认的行为是在发现源代码被更新后会通过自动刷新整个页面来做到实时预览，开启模块热替换功能后将==在不刷新整个页面的情况下通过用新模块替换老模块来做到实时预览==。除了通过重新刷新整个网页来实现实时预览，DevServer 还有一种被称作模块热替换的刷新技术。 模块热替换能做到在不重新加载整个网页的情况下，通过将被更新过的模块替换老的模块，再重新执行一次来实现实时预览。 模块热替换相对于默认的刷新机制能提供更快的响应和更好的开发体验。（问题：与动态刷新的区别）

### 其他配置项

```
--quiet 控制台中不输出打包的信息
--compress 开启gzip压缩
--progress 显示打包的进度
```



参考链接
- [webpack-dev-server使用方法，看完还不会的来找我~](https://segmentfault.com/a/1190000006670084)
- [2-6DevServer](http://www.xbhub.com/wiki/webpack/2%E9%85%8D%E7%BD%AE/2-6DevServer.html)