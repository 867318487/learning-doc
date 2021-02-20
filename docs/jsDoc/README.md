
# jsBridge原理 ✅
## JSBridge 的用途
JSBridge 是 Native 和非 Native 之间的桥梁，它的核心是 构建 Native 和非 Native 间消息通信的通道，而且是 双向通信的通道。
所谓 双向通信的通道:
- JS 向 Native 发送消息 : 调用相关功能、通知 Native 当前 JS 的相关状态等。
- Native 向 JS 发送消息 : 回溯调用结果、消息推送、通知 JS 当前 Native 的状态等。

## JSBridge 的双向通信原理
### JS 调用 Native
JS 调用 Native 的实现方式较多，主要有拦截 URL Scheme 、重写 prompt 、注入 API 等方法。

#### 注入 API
基于 Webview 提供的能力，我们可以==向 Window 上注入对象或方法==。JS 通过这个对象或方法进行调用时，执行对应的逻辑操作，可以直接调用 Native 的方法。使用该方式时，JS 需要等到 Native 执行完对应的逻辑后才能进行回调里面的操作。

Android 的 Webview 提供了 addJavascriptInterface 方法，支持 Android 4.2 及以上系统。

```
gpcWebView.addJavascriptInterface(new JavaScriptInterface(), 'nativeApiBridge'); 
public class JavaScriptInterface {
	Context mContext;

  JavaScriptInterface(Context c) {
    mContext = c;
  }

  public void share(String webMessage){	    	
    // Native 逻辑
  }
}

```
调用示例
```js
window.nativeApiBridge.share(xxx);
```
iOS 的 UIWebview 提供了 JavaScriptScore 方法，支持 iOS 7.0 及以上系统。**WKWebview 提供了 window.webkit.messageHandlers 方法**，支持 iOS 8.0 及以上系统。UIWebview 在几年前常用，目前已不常见。以下为创建  WKWebViewConfiguration 和 创建 WKWebView 示例：

```
WKWebViewConfiguration *configuration = [[WKWebViewConfiguration alloc] init];
WKPreferences *preferences = [WKPreferences new];
preferences.javaScriptCanOpenWindowsAutomatically = YES;
preferences.minimumFontSize = 40.0;
configuration.preferences = preferences;
    

- (void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];
    [self.webView.configuration.userContentController addScriptMessageHandler:self name:@"share"];
  	[self.webView.configuration.userContentController addScriptMessageHandler:self name:@"pickImage"];
}
- (void)viewWillDisappear:(BOOL)animated
{
    [super viewWillDisappear:animated];
    [self.webView.configuration.userContentController 	removeScriptMessageHandlerForName:@"share"];
    [self.webView.configuration.userContentController removeScriptMessageHandlerForName:@"pickImage"];
}

```
调用示例
```js
window.webkit.messageHandlers.share.postMessage(xxx);
```



### Native 调用 JS
Native 调用 JS 比较简单，不管是**iOS** 的 **UIWebView** 还是 **WKWebView**，还是 **Android** 的 **WebView** 组件，都以子组件的形式存在于 View/Activity 中。**只要 H5 将 JS 方法暴露在 Window 上给 Native 调用即可。**

#### `Android `中主要有两种方式实现。
1. 在 4.4 以前，通过 loadUrl 方法，执行一段 JS 代码来实现。loadUrl 方法使用起来方便简洁，但是效率低无法获得返回结果且调用的时候会刷新 WebView。
```
webView.loadUrl("javascript:" + javaScriptString);
//举例： 调用js中的JSBridge.trigger方法
webView.loadUrl("javascript:JSBridge.trigger('webviewReady')");

```

2. 在 4.4 以后，可以使用 evaluateJavascript 方法实现。evaluateJavascript 方法效率高获取返回值方便，调用时候不刷新WebView，但是只支持 Android 4.4+。

```
webView.evaluateJavascript(javaScriptString, new ValueCallback<String>() {
  @Override
  public void onReceiveValue(String value){
    xxx
  }
});
```

#### `iOS `在 WKWebview 中可以通过 evaluateJavaScript:javaScriptString 来实现，支持 iOS 8.0 及以上系统。

```
[wkWebView evaluateJavaScript:javaScriptString completionHandler:completionHandler];

```


```
// swift
func evaluateJavaScript(_ javaScriptString: String, 
  completionHandler: ((Any?, Error?) -> Void)? = nil)
// javaScriptString 需要调用的 JS 代码
// completionHandler 执行后的回调

```

```
// objective-c
[jsContext evaluateJavaScript:@"ZcyJsBridge(ev, data)"]
```

## JSBridge 接口实现
JSBridge 的接口主要功能有两个：调用 Native（给 Native 发消息） 和被 Native 调用（接收 Native 消息）。

```js
(function () {
    var id = 0,
        callbacks = {},
        registerFuncs = {};

    window.JSBridge = {
        // 调用 Native（给 Native 发消息）
        invoke: function(bridgeName, callback, data) {
            // 判断环境，获取不同的 nativeBridge
            var thisId = id ++; // 获取唯一 id
            callbacks[thisId] = callback; // 存储 Callback
            nativeBridge.postMessage({
                bridgeName: bridgeName,
                data: data || {},
                callbackId: thisId // 传到 Native 端
            });
        },
        //被 Native 调用（接收 Native 消息）
        receiveMessage: function(msg) {
            var bridgeName = msg.bridgeName,
                data = msg.data || {},
                callbackId = msg.callbackId, // Native 将 callbackId 原封不动传回
                responstId = msg.responstId;
            // 具体逻辑
            // bridgeName 和 callbackId 不会同时存在
            if (callbackId) {
                if (callbacks[callbackId]) { // 找到相应句柄
                    callbacks[callbackId](msg.data); // 执行调用
                }
            } else if (bridgeName) {
                if (registerFuncs[bridgeName]) { // 通过 bridgeName 找到句柄
                    var ret = {},
                        flag = false;
                    registerFuncs[bridgeName].forEach(function(callback) => {
                        callback(data, function(r) {
                            flag = true;
                            ret = Object.assign(ret, r);
                        });
                    });
                    if (flag) {
                        nativeBridge.postMessage({ // 回调 Native
                            responstId: responstId,
                            ret: ret
                        });
                    }
                }
            }
        },
        register: function(bridgeName, callback) {
            if (!registerFuncs[bridgeName])  {
                registerFuncs[bridgeName] = [];
            }
            registerFuncs[bridgeName].push(callback); // 存储回调
        }
    };
})();
```
在 Native 端配合实现 JSBridge 的 JavaScript 调用 Native 逻辑也很简单，主要的代码逻辑是：接收到 JavaScript 消息 => 解析参数，拿到 bridgeName、data 和 callbackId => 根据 bridgeName 找到功能方法，以 data 为参数执行 => 执行返回值和 callbackId 一起回传前端。 Native 调用 JavaScript 也同样简单，直接自动生成一个唯一的 ResponseId，并存储句柄，然后和 data 一起发送给前端即可。


## JSBridge 的使用
如何引用

- 由 H5 引用

采用本地引入 npm 包的方式进行调用。这种方式可以确定 JSBridge 是存在的，可直接调用 Native 方法。但是如果后期 Bridge 的实现方式改变，双方需要做更多的兼容，维护成本高

- 由 Native 注入

在考虑到后期业务需要的情况下，进行了重新设计，选用 Native 注入的方式来引用 JSBridge。这样有利于保持 API 与 Native 的一致性，但是缺点是在 Native 注入的方法和时机都受限，JS 调用 Native 之前需要先判断 JSBridge 是否注入成功


## 参考资料
1. [小白必看，JSBridge 初探](https://juejin.im/post/5e5248216fb9a07cb0314fc9)
2. [移动混合开发中的 JSBridge](https://mp.weixin.qq.com/s/I812Cr1_tLGrvIRb9jsg-A)
3. [浅谈 RPC](https://www.imooc.com/article/291548?block_id=tuijian_wz)


## 性能优化

## 高阶函数/函数式编程

## web worker

