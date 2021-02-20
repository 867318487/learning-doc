# 输入一个url发生了什么
## 主干流程
- ==DNS解析== 先本地缓存找，在一层层将常见地址解析成唯一对应的ip地址。如果请求协议是HTTPS，那么还需要建立TLS连接。基本顺序为：本地域名服务器-》根域名服务器=》com顶级域名服务器一次类推下去。找到后记录并缓存下来。如www.google.com=>.=>.com=>google.com.=>www.google.com.
- ==TCP连接== 三次握手，只要没有收到确认消息就要重发（见计算机网路/tcp章节）
- ==发送HTTP请求== 浏览器会分析这个url，并设置好请求报文发出去。请求报文包括请求行、请求头、请求主体。https默认请求端口443,http默认80。
- 浏览器解析渲染页面
> - 通过HTML解析器解析HTML文档，构建一个DOM Tree。同时通过CSS解析器解析HTML中存在的CSS，构建Style Rules，两者结合形成一个Attachment。
> - 通过两者结合形成一个Attachment构造一个渲染树（Render Tree）
> - Render Tree构建完毕，进入到布局阶段，将会为每一个阶段分配一个应该出现在屏幕上的确切坐标。
> - 最后讲全部节点遍历绘制出来后，一个页面就展现出来了。遇到script会停下来执行，所以通常会把script房子啊底部。
- 连接结束


参考链接
- [前端经典面试题: 从输入URL到页面加载发生了什么？](https://segmentfault.com/a/1190000006879700)
- [从输入URL到页面加载的过程？如何由一道题完善自己的前端知识体系！](https://segmentfault.com/a/1190000013662126)
- [从输入 URL 到页面加载完成的过程中都发生了什么事情？](http://fex.baidu.com/blog/2014/05/what-happen/)  （本文侧重硬件知识）
- [(超详细）从输入url到页面展示发生了什么？](https://juejin.im/post/6869279683230629896?utm_source=gold_browser_extension)