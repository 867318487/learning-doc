#  webpack全局引入的问题
现在项目中安装jq

```
yarn add jquery
```

## 方法一：jq暴露为 window. $
正常用法

```js
//在js中
import $ from 'jquery';
console.log($);//可以打印出来
console.log(window.$);//undefined
```


解决：
通过expose-loader 暴露全局的loader

```
//安装
yarn add jquery
yarn add expose-loader
```


用法：
在js中直接写（内联的loader）

```js
//expose-loader暴露全局的loader 
import $ from 'expose-loader?$!jquery';
console.log(window.$);//正常打印
```

配置文件处理
webpack v1 用法

```
module:{
    rules:[//匹配引入jq
    {
        test:require.resolve('jquery'),
        use:'expose-loader?$'
    },
    ]
}
```


js中使用



```js
import $ from 'jquery'
console.log(windows.$) //正常输出
```


webpack v2 用法

```
module: {
  rules: [{
    test: require.resolve('jquery'),
    use: [{
      loader: 'expose-loader',
      options: '$'
    }]
  }]
}
```





除了暴露为 window. $ 之外，假设你还想把它暴露为 window.jQuery。 对于多个暴露，你可以在 loader 字符串中使用 !：

```js
module: {
  loaders: [
    { test: require.resolve("jquery"), loader: "expose-loader?$!expose-loader?jQuery" },
  ]
}
```


```js
module: {
  rules: [{
          test: require.resolve('jquery'),
          use: [{
              loader: 'expose-loader',
              options: 'jQuery'
          },{
              loader: 'expose-loader',
              options: '$'
          }]
      }]
}
```
方法二：
在每个模块引入
此种方式通过  window.$取不到

```js
let webpack=require('webpack')
...
plugins：[
    new ProvidePlugin({//webpack的插件  在每个模块引入$
         $:'jquery'      
    }))
]
```


js中使用

```js
//直接获取
console.log($) //正常输出
console.log(windows.$) //仅在每个模块引入，没有暴露在全局
```
方法三
引入CDN不不打包模块中的

```js
//index.js
<script src="https://cdn.bootcss.com/jquery/3.3.1/jquery.js">
```


在js中使用

```js
import $ from 'jquery'
```


不打包当前的jquery

```
externals:{
    jauery:"$"
}
```




