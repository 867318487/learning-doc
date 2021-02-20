# Service Worker
Service Worker是浏览器在后台独立于网页运行的脚本，它打开了通向不需要网页或用户交互的功能的大门。 现在，它们已包括如推送通知和后台同步等功能。 将来，Service Worker将会支持如定期同步或地理围栏等其他功能。
## 生命周期
第一次访问时Service Worker的生命周期
installing → installed → activating → activated

在js没有修改的情况下刷新，直接显示当前激活态
installed（注册成功） → activated

修改了Service Worker注册JS，然后重载的时候旧的Service Worker还在跑，新的Service Worker已经安装等待激活
注册成功 → waiting → installed

## 安装

通过注册 Service Worker，你可以告诉浏览器你的 Service Worker 的 JavaScript 文件的位置。
```
if(serviceWorker in navigator){
    window.addEventListener('load',function(){
        navigator.serviceWorker.register('/sw.js').then(function(registration){
            console.log('ServiceWorker registration successful');
        },function(err){
            console.log('ServiceWorker registration failed',err);
        })
    })
}
```
- 每次页面加载时都可以调用 `navigator.serviceWorker.register()` 方法，浏览器会判断 Service Worker 是否已经注册，根据注册情况会对应的给出正确处理。`register() `方法的一个重要细节是 Service Worker 文件的位置。在本例中，可以看到 Service Worker 文件位于域的根目录，这个 Service Worker 将为这个域中的所有内容接收 fetch 事件。
- 用户第一次访问你的 Web 应用程序。目前还没有 Service Worker，浏览器无法预先知道最终是否会安装 Service Worker。如果安装了 Service Worker，浏览器将需要为这个额外的线程花费额外的 CPU 和内存，否则浏览器将把这些额外的 CPU 和内存用于呈现 Web 页面。
- 如果在页面上安装一个 Service Worker，就可能会有延迟加载和渲染的风险 —— 而不是尽快让你的用户可以使用该页面。
- 注意，这种情况对第一次的访问页面时才会有。后续的页面访问不会受到 Service Worker 安装的影响。一旦 Service Worker 在第一次访问页面时被激活，它就可以处理加载/缓存事件，以便后续访问 Web 应用程序。

## 激活
在激活步骤之后，Service Worker 将控制所有属于其范围的页面，尽管第一次注册 Service Worker 的页面将不会被控制，直到再次加载。
Service Worker 一旦掌控，它将处于以下两种状态之一：
- 处理从网页发出网络请求或消息时发生的提取和消息事件
- Service Worker 将被终止以节省内存

```
// 缓存更新
self.addEventListener('activate', function(event) {
  event.waitUntil(
  //检索缓存中所有键
    caches.keys().then(function(cacheNames) {
      return Promise.all(
      //遍历所有缓存文件
        cacheNames.map(function(cacheName) {
          // 如果当前版本和缓存版本不一致则删除
          if (cacheName !== VERSION) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

```
self.addEventListener('activate', function(event) { /* 激活后... */ });
```
> 'activate'用来缓存更新

## 安装
以下是处理安装事件时需要采取的步骤:
- 开启一个缓存
- 缓存我们的文件
- 确认是否缓存了所有必需的资源

```
const pluckDeep = ke;
var CACHE_NAME = 'my-web-app-cache';
var urlToCache = [
   '/',
   '/styles/main.css',
   '/scripts/app.js',
   '/scripts/lib.js'
];
self.addEventListener('install',function(event){
    // event.waitUntil 需要一个promise ，以了解安装需要多长时间
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache){
            console.log('Opened cache');
            return cache.addAll(urlToCache);
        })
    );
});
```
调用了caches.open() 和我们想要的缓存名称, 之后调用 cache.addAll() 并传入文件数组。 这是一个promise 链（ caches.open() 和 cache.addAll() ）。 event.waitUntil() 方法接受一个承诺，并使用它来知道安装需要多长时间，以及它是否成功。

```
self.addEventListener('install', function(event) { /* 安装后... */ });
```
> 'install'用来缓存文件

## fetch事件
```
// 捕获请求并返回缓存数据
self.addEventListener('fetch', function(event) {
  event.respondWith(
   //此方法查看请求，并从Service worker创建的所有缓存中找到已缓存的结果
  caches.match(event.request).catch(function() {
    return fetch(event.request);
  }).then(function(response) {
    caches.open(VERSION).then(function(cache) {
    //将请求添加到缓存中以备将来查询
      cache.put(event.request, response);
    });
    return response.clone();
  }).catch(function() {
    return caches.match('./static/mm1.jpg');
  }));
});
```

Service Worker还支持fetch事件，来响应和拦截各种请求。
```
self.addEventListener('fetch', function(event) { /* 请求后... */ });
```
> 'fetch'用来拦截请求直接返回缓存数据

## 要求 HTTPS 的原因
在构建 Web 应用程序时，通过 localhost 使用 Service Workers，但是一旦将其部署到生产环境中，就需要准备好 HTTPS( 这是使用HTTPS 的最后一个原因)。
使用 Service Worker，可以很容易被劫持连接并伪造响应。如果不使用 HTTPs，人的web应用程序就容易受到黑客的攻击。
为了更安全，你需要在通过 HTTPS 提供的页面上注册 Service Worker，以便知道浏览器接收的 Service Worker 在通过网络传输时未被修改。


## PWA技术（待补充）
PWA全称为“Progressive Web Apps”，渐进式网页应用。功效显著，收益明显
PWA的核心技术包括：
- Web App Manifest – 在主屏幕添加app图标，定义手机标题栏颜色之类
- Service Worker – 缓存，离线开发，以及地理位置信息处理等
- App Shell – 先显示APP的主结构，再填充主数据，更快显示更好体验
- Push Notification – 消息推送，之前有写过“简单了解HTML5中的Web Notification桌面通知”
Service Worker仅仅是PWA技术中的一部分，但是又独立于PWA。

参考链接
- [借助Service Worker和cacheStorage缓存及离线开发](https://www.zhangxinxu.com/wordpress/2017/07/service-worker-cachestorage-offline-develop/
)
- [JavaScript 是如何工作的：Service Worker 的生命周期及使用场景](https://github.com/qq449245884/xiaozhi/issues/8)
- [PWA概念通识面试题](https://juejin.im/post/6844904052166230030#heading-2)