# Loader
Webpack 原生不支持解析 CSS 文件。要支持非 JavaScript 类型的文件，需要使用 Webpack 的 Loader 机制。

## 配置和使用
### config中配置
```
module.exports = {
  // JavaScript 执行入口文件
  entry: './main.js',
  output: {
  //....
  },
  module: {
    rules: [
      {
        // 用正则去匹配要用该 loader 转换的 CSS 文件
        test: /\.css$/,
        use: [
            'style-loader', 
              {
                loader:'css-loader',
                options:{
                  minimize:true,//开启压缩
                }
              }
        ],
      }
    ]
  }
};
```
配置里的 module.rules 数组配置了一组规则，告诉 Webpack 在遇到哪些文件时使用哪些 Loader 去加载和转换。 如上配置告诉 Webpack 在遇到以 .css 结尾的文件时先使用 css-loader 读取 CSS 文件，再交给 style-loader 把 CSS 内容注入到 JavaScript 里。
- Loader 的执行顺序是==由后到前==的。
- 每一个 Loader 都可以通过` URL querystring `的方式传入参数，例如 `css-loader?minimize `中的 `minimize` 告诉` css-loader `要开启 CSS 压缩。

Webpack 构建前要先安装新引入的 Loader

```
npm i -D style-loader css-loader
```
安装成功后重新执行构建时，你会发现 bundle.js 文件被更新了，==里面注入了在 main.css 中写的 CSS，而不是会额外生成一个 CSS 文件。CSS 被写在了 JavaScript 里。== style-loader 它的工作原理大概是把 CSS 内容用 JavaScript 里的字符串存储起来， 在网页执行 JavaScript 时==通过 DOM 操作动态地往 HTML head 标签里插入 HTML style 标签==。

### 内联写法
可以在 import 等语句里指定 Loader，使用 ! 来将 Loader分开：

```
require('style-loader!css-loader?minimize!./main.css');
```
这样就能指定对` ./main.css `这个文件先采用 `css-loader `在采用 `style-loader `转换。

## Loader 类型
### 同步 Loader

```
module.exports = function(source) {
  const result = someSyncOperation(source); // 同步逻辑
  return result;
}
```
`Loader `都是同步的，通过 `return `或者` this.callback` 来同步地返回` source`转换后的结果。

### 异步Loader
有的时候，我们需要在 Loader 里做一些异步的事情，比如说需要发送网络请求。

```
module.exports = function(source) {
  // 告诉 webpack 这次转换是异步的
  const callback = this.async();
  // 异步逻辑
  someAsyncOperation(content, function(err, result) {
    if (err) return callback(err);
    // 通过 callback 来返回异步处理的结果
    callback(null, result, map, meta);
  });
};
```
### Pitching Loader
`Pitching Loader `是一个比较重要的概念，之前在 `style-loader` 里有提到过。

```
{
  test: /\.js$/,
  use: [
    { loader: 'aa-loader' },
    { loader: 'bb-loader' },
    { loader: 'cc-loader' },
  ]
}
```
Loader 总是从右到左被调用。上面配置的 Loader，就会按照以下顺序执行：

```
//  cc-loader -> bb-loader -> aa-loader
```
每个` Loader` 都支持一个 `pitch `属性，通过` module.exports.pitch` 声明。如果该 `Loader `声明了` pitch`，则该方法会优先于` Loader` 的实际方法先执行。==先从左向右执行一次每个 Loader 的 pitch 方法==，再按照从右向左的顺序执行其实际方法。

### Raw Loader

```
export const raw = true;
```
默认情况下，webpack 会把文件进行 UTF-8 编码，然后传给 Loader。==通过设置 raw，Loader 就可以接受到原始的 Buffer 数据==。


## vue-loader
「vue-loader」 是一个 webpack 的 loader，它允许你以一种名为单文件组件的格式撰写 Vue 组件。

### 安装与使用

```
 Vue 框架运行需要的库
npm i -S vue
# 构建所需的依赖
npm i -D vue-loader css-loader vue-template-compiler
```
在这些依赖中，它们的作用分别是：

- vue-loader：==解析和转换 .vue 文件==，提取出其中的逻辑代码 script、样式代码 style、以及 HTML 模版。 template，==再分别把它们交给对应的 Loader 去处理==。
- css-loader：加载由 vue-loader 提取出的 CSS 代码。
- vue-template-compiler：把 vue-loader 提取出的 HTML 模版编译成对应的可执行的 JavaScript 代码，这和 React 中的 JSX 语法被编译成 JavaScript 代码类似。预先编译好 HTML 模版相对于在浏览器中再去编译 HTML 模版的好处在于性能更好。

```
// webpack.config.js
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      // 它会应用到普通的 `.js` 文件
      // 以及 `.vue` 文件中的 `<script>` 块
      {
        test: /\.js$/,
        loader: 'babel-loader'
      },
      // 它会应用到普通的 `.css` 文件
      // 以及 `.vue` 文件中的 `<style>` 块
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    // 请确保引入这个插件来施展魔法
    new VueLoaderPlugin()
  ]
}

```

一个标准的 Vue 组件可以分为三部分：

1、template: 模板
2、script: 脚本
3、stype: 样式

Vue 组件里的` <template> `部分解析到` <body>` 下，css 部分解析成 `<style> `标签，`<script>` 部分则解析到 js 文件里。

### 源码解析之整体分析
入口看起，从上往下看：

```
module.exports = function (source) {}
//vue-loader 接收一个 source 字符串，值是 vue 文件的内容。
```

```
const stringifyRequest = r => loaderUtils.stringifyRequest(loaderContext, r)
//loaderUtils.stringifyRequest 作用是将绝对路径转换成相对路径。
```
接下来有一大串的声明语句，我们暂且先不看，我们先看最简单的情况。

```
const { parse } = require('@vue/component-compiler-utils') //导入parse方法

const descriptor = parse({
  source,
  compiler: options.compiler || loadTemplateCompiler(loaderContext),
  filename,
  sourceRoot,
  needMap: sourceMap
})
```
parse 方法是来自于 component-compiler-utils，代码简略一下是这样：

```
// component-compiler-utils parse
function parse(options) {
  const { source, filename = '', compiler, compilerParseOptions = { pad: 'line' }, sourceRoot = '', needMap = true } = options;
  // ...
  output = compiler.parseComponent(source, compilerParseOptions);
  // ...
  return output;
}
```
这里还不是真正 parse 的地方，实际上是调用了 compiler.parseComponent 方法，默认情况下 compiler 指的是 vue-template-compiler。

```
// vue-template-compiler parseComponent
function parseComponent (
  content,
  options
) {
  var sfc = {
    template: null,
    script: null,
    styles: [],
    customBlocks: [],
    errors: []
  };
  // ...
  function start() {}
  function end() {}
  parseHTML(content, {
    warn: warn,
    start: start,
    end: end,
    outputSourceRange: options.outputSourceRange
  });
  return sfc;
}
```
parseComponent 应该是调用了 parseHTML 方法，并且传入了两个方法：start 和 end，最终返回 sfc。

我们可以猜测 start 和 end 这两个方法应该是会根据不同的规则去修改 sfc，我们看一下 sfc 即 vue-loader 中 descriptor 是怎么样的：

```
// vue-loader descriptor
{
  customBlocks: [],
  errors: [],
  template: {
    attrs: {},
    content: "\n<div id="app">\n  <div class="title">{{msg}}</div>\n</div>\n",
    type: "template"
  },
  script: {
    attrs: {},
    content: "... export default {} ...",
    type: "script"
  },
  style: [{
    attrs: {
      lang: "scss"
    },
    content: "... #app {} ...",
    type: "style",
    lang: "scss"
  }],
}
```
### vue-loader 如何处理不同 type

最终作用是针对不同的 type 分别构造一个 import 字符串：

```
templateImport = "import { render, staticRenderFns } from './App.vue?vue&type=template&id=7ba5bd90&'";

scriptImport = "import script from './App.vue?vue&type=script&lang=js&'
                export * from './App.vue?vue&type=script&lang=js&'";

stylesCode = "import style0 from './App.vue?vue&type=style&index=0&lang=scss&'";
```
这三个 import 语句有什么用呢， vue-loader 是这样做的：
```
let code = `
${templateImport}
${scriptImport}
${stylesCode}`.trim() + `\n`
code += `\nexport default component.exports`
return code
```
此时， code 是这样的：

```
code = "
import { render, staticRenderFns } from './App.vue?vue&type=template&id=7ba5bd90&'
import script from './App.vue?vue&type=script&lang=js&'
export * from './App.vue?vue&type=script&lang=js&'
import style0 from './App.vue?vue&type=style&index=0&lang=scss&'

// 省略 ...
export default component.exports"
```
code 里有三次的 import，import 的文件都是 App.vue，相当于又加载了一次触发这次 vue-loader 的那个 vue 文件。不同的是，==这次加载是「带参」的，分别对应着 template / script / style 三种 type 的处理。==

总结：
webpack 在加载 vue 文件时，会==调用 vue-loader 来处理 vue 文件，之后 return 一段可执行的 js== 代码，其中会根据不同 type 分别 import 一次当前 vue 文件，并且==将参数传递进去，这里的多次 import 也会被 vue-loader 拦截，然后在 vue-loader 内部根据不同参数进行处理==（比如调用 style-loader）。

## style-loader
### 作用
style-loader 的功能就一个，在 DOM 里插入一个 `<style> `标签，并且将 CSS 写入这个标签内。

简单来说是这样：

```
const style = document.createElement('style'); // 新建一个 style 标签
style.type = 'text/css';
style.appendChild(document.createTextNode(content)) // CSS 写入 style 标签
document.head.appendChild(style); // style 标签插入 head 中
```

### 安装与配置

```

npm install style-loader --save-dev
```

```
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(css)$/,
        use: [
          {
            loader: 'style-loader',
             options: {
                injectType: 'singletonStyleTag',//默认值是styleTag
             },
          },
          { loader: 'css-loader' },
        ],
      },
    ],
  },
};
```
#### singletonStyleTag
==singletonStyleTag==，会按照引入顺序把两个样式文件的内容都被==放到同一个 `<style> `标签里==。

#### linkTag
当 ==injectType 为 linkTag==，会通过 <link rel="stylesheet" href=""> 的形式将样式插入到 DOM 中，==此时 style-loader 接收到的数据应该是样式文件的地址==，所以搭配的 loader 应该是 ==file-loader== 而不是 css-loader。

值为`linkTag`打包前

```
// js
const globalStyle = require('./assets/style/global.css');
const indexStyle = require('./assets/style/index.css');
```
打包后
```
<head>
  <link rel="stylesheet" href="f2742027f8729dc63bfd46029a8d0d6a.css">
  <link rel="stylesheet" href="34cd6c668a7a596c4bedad32a39832cf.css">
</head>
```
#### lazyStyleTag, lazySingletonStyleTag
这两种类型的 injectType 区别在于它们是延迟加载的：

```
// 打包前的js
const globalStyle = require('./assets/style/global.css');
const indexStyle = require('./assets/style/index.css');
```
==如果像上面一样导入了样式文件，样式是不会插入到 DOM 中的==，需要手动使用 globalStyle.use() 来延迟加载 global.css 这个样式文件。

```
   globalStyle.use();
```
### 源码分析
style-loader 主要可以分为：
- 打包阶段
- runtime 阶段

#### 打包阶段
引入依赖部分

```
//定义了一个 _interopRequireDefault 方法，传入的是一个 require()。
var _path = _interopRequireDefault(require("path"));
var _loaderUtils = _interopRequireDefault(require("loader-utils"));
var _schemaUtils = _interopRequireDefault(require("schema-utils"));
var _options = _interopRequireDefault(require("./options.json"));
//如果引入的是 es6 模块，直接返回，如果是 commonjs 模块，则将引入的内容放在一个对象的 default 属性上，然后返回这个对象。
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
```


```
module.exports = () => {};
module.exports.pitch = function loader(request) {}
```
style-loader 的导出方式和普通的 loader 不太一样，默认导出一个空方法，通过 pitch 导出的。
默认的 loader 都是从右向左像管道一样执行，而 ==pitch 是从左到右执行的==。

这样做的原因：
style-loader 的作用是将 CSS 代码插入到 DOM 中，如果按照顺序从 css-loader 接收到一个 js 字符串的话，就无法获取到真实的 CSS 样式了。所以==正确的做法是先执行 style-loader，在它里面去执行 css-loader ，拿到经过处理的 CSS 内容，再插入到 DOM 中==。

`loader `的内容：
```
// 获取 webpack 配置里的 options
const options = _loaderUtils.default.getOptions(this) || {};
// 校验 options
(0, _schemaUtils.default)(_options.default, options, {
  name: 'Style Loader',
  baseDataPath: 'options'
});

// style 标签插入的位置，默认是 head
const insert = typeof options.insert === 'undefined' ? '"head"' : typeof options.insert === 'string' ? JSON.stringify(options.insert) : options.insert.toString();
// 设置以哪种方式插入 DOM 中
// 详情见这个：https://github.com/webpack-contrib/style-loader#injecttype
const injectType = options.injectType || 'styleTag';

//根据不同的 injectType 会 return 不同的 js 代码，在 runtime 的时候执行。
switch (injectType) {
  case 'linkTag': {}
  case 'lazyStyleTag':
  case 'lazySingletonStyleTag': {}
  case 'styleTag':
  case 'singletonStyleTag':
  default: {}
}
```
根据不同的 injectType 会 return 不同的 js 代码，在 runtime 的时候执行。

看看默认情况：

```
return `var content = require(${_loaderUtils.default.stringifyRequest(this, `!!${request}`)});

if (typeof content === 'string') {
  content = [[module.id, content, '']];
}

var options = ${JSON.stringify(options)}

options.insert = ${insert};
options.singleton = ${isSingleton};

var update = require(${_loaderUtils.default.stringifyRequest(this, `!${_path.default.join(__dirname, 'runtime/injectStylesIntoStyleTag.js')}`)})(content, options);

if (content.locals) {
  module.exports = content.locals;
}
${hmrCode}`;
```
_loaderUtils.default.stringifyRequest(this, `!!${request}`) 这个方法的作用是将绝对路径转换成相对路径。比如：

```
import css from './asset/style/global.css';
// 此时传递给 style-loader 的 request 会是
request = '/test-loader/node_modules/css-loader/dist/cjs.js!/test-loader/assets/style/global.css';
// 转换
_loaderUtils.default.stringifyRequest(this, `!!${request}`);
// result: "!!../../node_modules/css-loader/dist/cjs.js!./global.css"
```
所以 content 的实际内容就是：

```
var content = require("!!../../node_modules/css-loader/dist/cjs.js!./global.css");
```
也就是在这里才去调用 css-loader 来处理样式文件。

!! 模块前面的两个感叹号的作用是禁用 loader 的配置的，如果不禁用的话会出现无限递归调用的情况。

同样的，update 的实际内容是：

```
./../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js")(content, options);
```
意思也就是调用 `injectStylesIntoStyleTage `模块来处理经过` css-loader` 处理过的样式内容` content`。

上述代码都是 `style-loader` 返回的，真正执行是在` runtime `阶段。


参考链接
- [前端工程师都得掌握的 webpack Loader](https://github.com/axuebin/articles/issues/38)
- [webpack loader 从上手到理解系列：vue-loader](https://mp.weixin.qq.com/s/NO5jZfoHZbjOwR8qiWnXmw)
- [webpack loader 从上手到理解系列：style-loader](https://mp.weixin.qq.com/s/alIKsKkGRU_yyjpeV8i0og)

