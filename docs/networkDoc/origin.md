# 跨域
## 什么是跨域
同源策略是一种约定，它是浏览器最核心也最基本的安全功能，如果缺少了同源策略，浏览器很容易受到XSS、CSRF等攻击。所谓同源是指"==协议+域名+端口"三者相同==，即便两个不同的域名指向同一个ip地址，也非同源。

同源策略限制内容有：
- Cookie、LocalStorage、IndexedDB 等存储性内容
- DOM 节点
- AJAX 请求发送后，结果被浏览器拦截了

允许跨域的标签
- img标签
- <link href=XXX>
- <script src=XXX>

特别说明两点：
- 如果是协议和端口造成的跨域问题“前台”是无能为力的。
- 在跨域问题上，仅仅是通过“URL的首部”来识别而不会根据域名对应的IP地址是否相同来判断。“URL的首部”可以理解为“协议, 域名和端口必须匹配”。

跨域并不是请求发不出去，请求能发出去，服务端能收到请求并正常返回结果，只是结果被浏览器拦截了。

## JSONP
利用` <script> `标签没有跨域限制的漏洞，网页可以得到从其他来源动态产生的 `JSON `数据。`JSONP`请求一定需要对方的服务器做支持才可以。

JSONP的实现流程

1. 声明一个回调函数(如show)当做参数值，要传递给跨域请求数据的服务器，==函数形参为要获取目标数据==(服务器返回的data)。
2. 创建一个<script>标签，把那个跨域的API数据接口地址，赋值给==script的src==,还要在这个地址中向服务器传递该函数名（?==callback=show==）。
3. 服务器接收到请求后，需要进行特殊的处理：把传递进来的函数名和它需要给你的数据拼接成一个字符串,例如：传递进去的函数名是show，它准备好的数据是show('XXXX')。
4. 最后服务器把准备的数据通过HTTP协议返回给客户端，客户端再调用执行之前声明的回调函数（show），对返回的数据进行操作。


优缺点：
`JSONP`优点是简单兼容性好，可用于解决主流浏览器的跨域数据访问的问题。缺点是仅支持`get`方法具有局限性,不安全可能会遭受`XSS`攻击。

```js
// index.html
function jsonp({ url, params, callback }) {
  return new Promise((resolve, reject) => {
    let script = document.createElement('script') //创建一个script标签
    window[callback] = function(data) {//1、声明一个回调函数
      resolve(data)
      document.body.removeChild(script)
    }
    params = { ...params, callback } // wd=b&callback=show
    let arrs = []
    for (let key in params) {
      arrs.push(`${key}=${params[key]}`)
    }
    script.src = `${url}?${arrs.join('&')}`//2、把那个跨域的API数据接口地址，赋值给script的src
    document.body.appendChild(script)
  })
}
//调用实例
jsonp({
  url: 'http://localhost:3000/say',
  params: { wd: '请求传递的参数' },
  callback: 'show'  //回调函数
}).then(data => {
  console.log(data)
})

```
上面这段代码相当于向`http://localhost:3000/say?wd=请求传递的参数&callback=show`这个地址请求数据，然后后台返回`show('服务端返回的数据')`

服务端
```js
// server.js
let express = require('express')
let app = express()
app.get('/say', function(req, res) {
  let { wd, callback } = req.query
  console.log(wd) // Iloveyou
  console.log(callback) // show
  res.end(`${callback}('服务端返回的数据')`)  //3、拼成一个字符串返回
})
app.listen(3000)

```

## CORS
`CORS `需要浏览器和后端同时支持。IE 8 和 9 需要通过 `XDomainRequest` 来实现。

服务端设置 `Access-Control-Allow-Origin` 就可以开启 CORS。 该属性表示哪些域名可以访问资源，如果设置通配符则表示所有网站都可以访问资源。
通过这种方式解决跨域问题的话，会在发送请求时出现两种情况，分别为简单请求和复杂请求。

###  简单请求和非简单请求
浏览器发送 CORS 请求（跨域请求）时, 会将请求分为简单请求与复杂请求.

####  简单请求
- 请求的方法只能为HEAD、GET、POST
- 无自定义请求头
- Content-Type只能是这几种： 
1. text/plain  
2. multipart/form-data 
3. application/x-www-form-urlencoded

#### 非简单请求
不符合以上条件的请求就肯定是复杂请求了
- PUT, Delete 方法的 ajax 请求
- 发送 JSON 格式的 ajax 请求(比如post数据)
- 带自定义头的 ajax 请求

复杂请求在发生请求时, 如果是 CORS 请求，==浏览器预先发送一个 option 请求==。浏览器这种行为被称之为预检请求。

## document.domain
该方式只能用于二级域名相同的情况下，比如 a.test.com和b.test.com 适用于该方式。

只需要给页面添加 `document.domain = 'test.com'` 表示二级域名都相同就可以实现跨域。

## postMessage
postMessage()方法允许来自不同源的脚本采用异步方式进行有限的通信，可以实现跨文本档、多窗口、跨域消息传递。
可解决以下问题
postMessage是HTML5 XMLHttpRequest Level 2中的API，且是为数不多可以跨域操作的window属性之一，它可用于解决以下方面的问题：
- 页面和其打开的新窗口的数据传递
- 多窗口之间消息传递
- 页面与嵌套的iframe消息传递
- 上面三个场景的跨域数据传递

这种方式通常用于获取嵌入页面的第三方页面数据。一个页面发送数据，另一个页面判断来源并接收消息。

接下来我们看个例子： `http://localhost:3000/a.html`页面向`http://localhost:4000/b.html`传递“我爱你”,然后后者传回"我不爱你"。

```js
// a.html
  <iframe src="http://localhost:4000/b.html" frameborder="0" id="frame" onload="load()"></iframe> //等它加载完触发一个事件
  //b.html内嵌在http://localhost:3000/a.html中
    <script>
      function load() {
        let frame = document.getElementById('frame')
        frame.contentWindow.postMessage('我爱你', 'http://localhost:4000') //发送数据
        window.onmessage = function(e) { //接受返回数据
          console.log(e.data) //我不爱你
        }
      }
    </script>
```

```js
// b.html
  window.onmessage = function(e) {//接收a发送的数据
    console.log(e.data) //我爱你
    e.source.postMessage('我不爱你', e.origin)
 }
```

## websocket
Websocket是HTML5的一个持久化的协议，它实现了浏览器与服务器的全双工通信，同时也是跨域的一种解决方案。WebSocket和HTTP都是应用层协议，都基于 TCP 协议。但是 WebSocket 是一种双向通信协议，在建立连接之后，WebSocket 的 server 与 client 都能主动向对方发送或接收数据。

我们先来看个例子：本地文件socket.html向localhost:3000发生数据和接受数据

```js
// socket.html
<script>
    let socket = new WebSocket('ws://localhost:3000');
    socket.onopen = function () {
      socket.send('我爱你');//向服务器发送数据
    }
    socket.onmessage = function (e) {
      console.log(e.data);//接收服务器返回的数据
    }
</script>

```

```js
// server.js
let express = require('express');
let app = express();
let WebSocket = require('ws');//记得安装ws
let wss = new WebSocket.Server({port:3000});
wss.on('connection',function(ws) {
  ws.on('message', function (data) {
    console.log(data);
    ws.send('我不爱你')
  });
})

```

##  Node中间件代理(两次跨域)
实现原理：同源策略是浏览器需要遵循的标准，而如果是服务器向服务器请求就无需遵循同源策略。 代理服务器，需要做以下几个步骤：

- 接受客户端请求 。
- 将请求 转发给服务器。
- 拿到服务器 响应 数据。
- 将 响应 转发给客户端。

## nginx反向代理
实现原理类似于Node中间件代理，需要你搭建一个中转nginx服务器，用于转发请求。
使用nginx反向代理实现跨域，是最简单的跨域方式。只需要修改nginx的配置即可解决跨域问题，支持所有浏览器，支持session，不需要修改任何代码，并且不会影响服务器性能。

## 总结
- CORS支持所有类型的HTTP请求，是跨域HTTP请求的根本解决方案
- JSONP只支持GET请求，JSONP的优势在于支持老式浏览器，以及可以向不支持CORS的网站请求数据。
- 不管是Node中间件代理还是nginx反向代理，主要是通过同源策略对服务器不加限制。
- 日常工作中，用得比较多的跨域方案是cors和nginx反向代理

## cookie
XMLHttpRequest.withCredentials  属性是一个Boolean类型，它指示了是否该使用类似cookies,authorization headers(头部授权)或者TLS客户端证书这一类资格证书来创建一个跨站点访问控制（cross-site Access-Control）请求。

如果在发送来自其他域的XMLHttpRequest请求之前，未设置withCredentials 为true，那么就不能为它自己的域设置cookie值。而通过设置withCredentials 为true获得的第三方cookies，将会依旧享受同源策略，因此不能被通过document.cookie或者从头部相应请求的脚本等访问。

在同一个站点下使用withCredentials属性是无效的。


参考链接
- [九种跨域方式实现原理（完整版）](https://juejin.im/post/6844903767226351623)
- [[HTTP趣谈]支持跨域及相关cookie设置](https://www.jianshu.com/p/6a0e9e53a944)
- [XMLHttpRequest.withCredentials](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/withCredentials)

