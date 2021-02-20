# 代码分割
## 代码分割的做法
两种：
- 分离业务代码和第三方库（ vendor ）
- 按需加载（利用 import() 语法）

之所以把业务代码和第三方库代码分离出来，是因为需求是源源不断的，因此业务代码更新频率大，==相反第三方库代码更新迭代相对较慢且可以锁版本，所以可以充分利用浏览器的缓存来加载这些第三方库。==

而按需加载的适用场景，比如说「==访问某个路由的时候再去加载对应的组件==」，用户不一定会访问所有的路由，所以没必要把所有路由对应的组件都先在开始的加载完；更典型的例子是「某些用户他们的权限只能访问某些页面」，所以没必要把他们没权限访问的页面的代码也加载。

## 静态分割
静态代码分割是指：在代码中明确声明需要异步加载的代码。

```
import Listener from './listeners.js'
const getModal = () => import('./src/modal.js') Listener.on('didSomethingToWarrentModalBeingLoaded', () => {  // Async fetching modal code from a separate chunk  getModal().then((module) => {    const modalTarget = document.getElementById('Modal')    module.initModal(modalTarget)  })})
const getModal = () => import('./src/modal.js') 

```
每当你调用一个声明了异步加载代码的变量时，它总是返回一个 Promise 对象。

⚠️ 注意：==在 Vue 中，可以直接使用 import() 关键字做到这一点==，而在 React 中，你需要使用 react-loadable 去完成同样的事。

使用场景
1. **你正在使用一个非常大的库或框架**：如果在页面初始化时你不需要使用它，就不要在页面初载时加载它；
2. **任何临时的资源**：指不在页面初始化时被使用，被使用后又会立即被销毁的资源，例如模态框，对话框，tooltip 等（任何一开始不显示在页面上的东西都可以有条件的加载）；
3. **路由**：既然用户不会一下子看到所有页面，那么只把当前页面相关资源给用户就是个明智的做法；

## 动态分割
在代码调用时根据当前的状态，「动态地」异步加载对应的代码块。

```
const getTheme = (themeName) => import(`./src/themes/${themeName}`)

```
Webpack 会在构建时==将你声明的目录下的所有可能分离的代码都抽象为一个文件==（这被称为 contextModule 模块），因此无论你最终声明了调用哪个文件，==本质上就和静态代码分割一样，在请求一个早已准备好的，静态的文件==。

使用场景
1. A/B Test：你不需要在代码中引入不需要的 UI 代码；
2. 加载主题：根据用户的设置，动态加载相应的主题；
3. 为了方便：本质上，你可以用静态代码分割代替「动态」代码分割，但是后者比前者拥有更少的代码量；（少指代码数上的少）
4. 企业后台lang的打包

## 魔术注释
魔术注释是由 Webpack 提供的，可以为代码分割服务的一种技术。==通过在 import 关键字后的括号中使用指定注释，我们可以对代码分割后的 chunk 有更多的控制权==

```
// index.js
import (
  /* webpackChunkName: “my-chunk-name” */
  './footer'
)
```
同时，也要在 webpack.config.js 中做一些改动：
```
// webpack.config.js
{
  output: {
    filename: “bundle.js”,
    chunkFilename: “[name].lazy-chunk.js” //可以对分离出的 chunk 进行命名
  }
}
```
### Webpack Modes
==webpackMode 的默认值为 lazy 它会使所有异步模块都会被单独抽离成单一的 chunk==，若设置该值为 lazy-once，Webpack 就会将所有带有标记的异步加载模块放在同一个 chunk 中。

```
import (
  /* webpackChunkName: “my-chunk-name” */
  /* webpackMode: lazy */
  './someModule'
)
```
### Prefetch or Preload
通过添加 webpackPrefetch 魔术注释，Webpack 令我们可以使用与 `<link rel=“prefetch”> `相同的特性。让浏览器会在 Idle 状态时预先帮我们加载所需的资源，善用这个技术可以使我们的应用交互变得更加流畅。

```
import(
  /* webpackPrefetch: true */
  './someModule'
)
```

## 实战
第一次打包的情况：

```
// webpack.config.js
module.exports = {
  entry: {
     app: './src/main.js', // entry chunk
  },
}
```
当前只有一个 `chunk `也就是` app.js `，他是一个 `entry chunk` 。app.js 包含了我们的第三方库 `vue` 和 `axios` ，以及我们的业务代码 src 。

### 分离 Vendor
加一个 entry 
```
// webpack.config.js
module.exports = {
  entry: {
    app: './src/main.js',
    vendor: ['vue', 'axios'],//本次增加的
  },
}
```
虽然 vendor.js 这个 entry chunk 包含了我们想要的 vue 和 axios，但是app.js 中也有 vue 和 axios。
原因：
每个 entry 都包含了他自己的依赖，这样他才能作为一个入口，独立地跑起来。

### 提取公共模块CommonsChunkPlugin
webpack v4 legato中已删除CommonsChunkPlugin。要了解如何在最新版本中处理块，请查看[SplitChunksPlugi](https://webpack.js.org/plugins/split-chunks-plugin/) 

增加这一行，找到依赖2次及以上的模块，然后移到 vendor 这个 chunk 里面。
```
//webpack.config.js
new webpack.optimize.CommonsChunkPlugin({
  name: 'vendor',
}),
```
但是！随着业务的增长，我们依赖的第三方库代码很可能会越来越多，这时候我们的 webpack.config.js 就变成这样了：

```
module.exports = {
  entry: {
    app: './src/main.js',
    vendor: [
      'vue',
      'axio',
      'vue-router',
      'vuex',
      'element-ui',
      // 很长很长
    ],
  },
}
```
vendor entry 会变成很长很长，更糟糕的是，我们每次引入了新的第三方库，都需要在 vendor 手动增加对应的包名。

### 自动化分离 vendor
看见某些模块是来自 node_modules 目录的，并且名字是 .js 结尾的话，把他们都移到 vendor chunk 里去，如果 vendor chunk 不存在的话，就创建一个新的。
```
entry: {
  // vendor: ['vue', 'axios'] // 删掉!
},

new webpack.optimize.CommonsChunkPlugin({
  name: 'vendor',
  minChunks: ({ resource }) => (
    resource &&
    resource.indexOf('node_modules') >= 0 &&
    resource.match(/\.js$/)
  ),
}),
```
以下配置就能从网页 A 和网页 B 中抽离出公共部分，放到 common 中。
```
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');

new CommonsChunkPlugin({
  // 从哪些 Chunk 中提取
  chunks: ['a', 'b'],
  // 提取出的公共部分形成一个新的 Chunk，这个新 Chunk 的名称
  name: 'common'
})
```
通过以上配置输出的 common Chunk 中会包含所有页面都依赖的基础运行库 react、react-dom，为了把基础运行库从 common 中抽离到 base 中去，还需要做一些处理。

首先需要先配置一个 Chunk，这个 Chunk 中只依赖所有页面都依赖的基础库以及所有页面都使用的样式，为此需要在项目中写一个文件 base.js 来描述 base Chunk 所依赖的模块，文件内容如下：

```
//base.js
// 所有页面都依赖的基础库
import 'react';
import 'react-dom';
// 所有页面都使用的样式
import './base.css';
```
接着再修改 Webpack 配置，在 entry 中加入 base，相关修改如下：

```
module.exports = {
  entry: {
    base: './base.js'
  },
};
```

以上就完成了对新 Chunk base 的配置。

为了从 common 中提取出 base 也包含的部分，还需要配置一个 CommonsChunkPlugin，相关代码如下

```
new CommonsChunkPlugin({
  // 从 common 和 base 两个现成的 Chunk 中提取公共的部分
  chunks: ['common', 'base'],
  // 把公共的部分放到 base 中
  name: 'base'
})
```
由于 common 和 base 公共的部分就是 base 目前已经包含的部分，所以==这样配置后 common 将会变小，而 base 将保持不变。==
以上都配置好后重新执行构建，你将会得到四个文件，它们分别是：

- base.js：所有网页都依赖的基础库组成的代码；
- common.js：网页A、B都需要的，但又不在 base.js 文件中出现过的代码；
- a.js：网页 A 单独需要的代码；
- b.js：网页 B 单独需要的代码。

以上方法可能会出现 common.js 中没有代码的情况，原因是去掉基础运行库外很难再找到所有页面都会用上的模块。 在出现这种情况时，你可以采取以下做法之一：

- ==CommonsChunkPlugin 提供一个选项 minChunks，表示文件要被提取出来时需要在指定的 Chunks 中最小出现最小次数==。 假如 minChunks=2、 chunks=['a','b','c','d']，任何一个文件只要在 ['a','b','c','d'] 中任意两个以上的 Chunk 中都出现过，这个文件就会被提取出来。 你可以根据自己的需求去调整 minChunks 的值，==minChunks 越小越多的文件会被提取到 common.js 中去，但这也会导致部分页面加载的不相关的资源越多==； minChunks 越大越少的文件会被提取到 common.js 中去，但这会导致 common.js 变小、效果变弱。
- ==根据各个页面之间的相关性选取其中的部分页面用 CommonsChunkPlugin 去提取这部分被选出的页面的公共部分，而不是提取所有页面的公共部分，而且这样的操作可以叠加多次。 这样做的效果会很好==，但缺点是配置复杂，你需要根据页面之间的关系去思考如何配置，该方法不通用。

### 按需加载
如果我们想「按需加载」路由组件的话，修改以下几行。由直接导入改成使用时调用导入。

```
// router.js
<!--import Emoji from './pages/Emoji.vue' 旧的写法-->
<!--import Photos from './pages/photos.vue'旧的写法 -->

const Emoji = () => import(
  /* webpackChunkName: "Emoji" */
  './pages/Emoji.vue')//返回一个

const Photos = () => import(
  /* webpackChunkName: "Photos" */
  './pages/Photos.vue')
```
我们使用了 webpack v2.4 的新功能，可以设置 chunk 的名字；同时别忘了还要改 webpack 配置：

```
output: {
  chunkFilename: '[name].chunk.js',
}
```
如果你用了 Babel ，就需要装上这个插件：babel plugin syntax dynamic import 来解析 import() 语法。修改 .babelrc ：

```
{
  "plugins": ["syntax-dynamic-import"]
}
```
### 自动抽离公共文件

```
new webpack.optimize.CommonsChunkPlugin({
  async: 'used-twice',
  minChunks: (module, count) => (
    count >= 2
  ),
})
```
在所有的 async chunk ( Emoji.chunk.js 和 Photos.chunk.js ) 中找到引用 2 次以上的模块，也就是 MagicBtn 咯，那把他挪到 used-twice chunk 中，如果 used-twice 不存在的话，那就创建一个。

CommonsChunkPlugin 提供一个选项 minChunks，表示文件要被提取出来时需要在指定的 Chunks 中最小出现最小次数。 假如 minChunks=2、 chunks=['a','b','c','d']，任何一个文件只要在 ['a','b','c','d'] 中任意两个以上的 Chunk 中都出现过，这个文件就会被提取出来。

## 企业后台打包构建相关
### 在webpack配置中设置分析的插件
```
// webpack.config.js
//开启构建报告
if (process.env.npm_config_report) {
    const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
    const smp = new SpeedMeasurePlugin();
    webpackConfig = smp.wrap(webpackConfig);
    webpackConfig.plugins.push(new BundleAnalyzerPlugin());
}
```
在命令中开启
```
//package.json
{
 "scripts": {
      "build-report": "cross-env NODE_ENV=production npm_config_report=true webpack --config build/webpack.config.js",
 }
 }
```
### 优化
#### vendor chunk 体积优化

```
//main.js
import VueCodeMirror from 'vue-codemirror';
import VueECharts from 'echarts'
import 'codemirror/lib/codemirror.css';

Vue.use(VueCodeMirror);
Vue.prototype.$echarts = VueECharts;
```
发现main.js中有以上代码。删掉，然后在有需要的代码中再引入。

#### common chunk 体积优化
可以看到 ol库占用了相当多的体积，ol 是openlayer地图库，只有三个 chunk 中有用到，分别是：设备墙地图、geofencing地图、geofencing围栏管理。
所以这个依赖应该仅在这三个功能模块加载时候再下载。

另外可以看到其实有一些文件也不适合打包到 common chunk，例如上面显示的一些，devices ，kiosk， geofencing 模块中才用到的复用组件，或者是类似 只有ams与geofencing 两个模块使用到的组件。

```
/**
 * 代码分割
 * 文档：https://webpack.docschina.org/plugins/split-chunks-plugin/
 */
splitChunks: {
    cacheGroups: {
        vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'initial',
        },
        // 公共引入的包
        commons: {
            chunks: 'all',
            //至少有3个chunk中引入的代码，才会被构建到 common chunk
            minChunks: 3,
            minSize: 30000,
            name: 'commons',
            //优先级10
            priority: 10,
        },
        //因为openlayer有在3个chunk中引入，但是又不需要打包为公共chunk，所以将openLayer单独打包
        openLayer: {
            test: /[\\/]node_modules[\\/](ol)[\\/]/,
            chunks: 'all',
            name: 'openLayer',
            //优先级20，比上面commons高，所有openlayer的打包会优先于上面，上面打包出的common chunk中就不会打包openlayer
            priority: 20,
        },
    }
}
```
#### moment.js 体积优化
```
//webpack.config.common.js
//优化moment构建后的体积，仅仅打包需要的语言文件
new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /ru|zh-cn|zh-tw/),
```

#### 语言包按需加载

```
//i18n.js
loadLangPack();

async function loadLangPack() {
  const fileNames = {
    'en': 'en',
    'zh-cn': 'zh-CN',
    'zh-tw': 'zh-TW',
    'ru': 'ru'
  }

  const airUiLangPacks = {
    'en': airEn,
    'zh-cn': airZH_CN,
    'zh-tw': airZH_TW,
    'ru': airRU_RU
  }

  const langPack = await import( /* webpackChunkName: "lang" */ `./lang/${fileNames[lang]}.json` )

  i18n.setLocaleMessage(lang, { ...langPack, ...airUiLangPacks[lang] })
}
```
这样会把语言包文件每个都分别打包，在这里按需加载。
上述处理有一个缺点，执行i18n翻译的代码，不能早于语言包加载完成。否则就会出现没有翻译的情况。好在早于语言包加载就执行翻译的地方不多，很容易就处理了，但是这点今后需要注意。

#### store优化
目的是将各个功能模块的store文件，打包到功能模块的chunk中。
例如pricing模块：

```
//store/pricing.js
const moduleName = 'pricing'

/**
 * 引入的时候再动态注册此模块的 store
 */
!store.hasModule(moduleName) && store.registerModule(moduleName, {
    //store 的内容
});
```

```
//view/pricing/index.vue
//加载此模块时才会注册store
import 'STORE/pricing';
```

#### 代码压缩

```
optimization: {
    minimizer: [
            //压缩css
            new OptimizeCSSAssetsPlugin({
                cssProcessorPluginOptions: {
                    preset: ['default', { discardComments: { removeAll: true } }],
                }
            }),
            //压缩js
            new UglifyJSPlugin({
                cache: true,
                parallel: true,
                sourceMap: false,
                uglifyOptions: {
                    output: {
                        comments: false,
                    },
                    compress: {
                        warnings: false,
                        drop_debugger: isProd,
                        drop_console: isProd
                    }
                },
            })
        ],
}
```





参考文章
- [Webpack 大法之 Code Splitting](https://zhuanlan.zhihu.com/p/26710831)
- [Code Splitting](https://webpack.js.org/guides/code-splitting/)
- [4-11 提取公共代码](http://www.xbhub.com/wiki/webpack/4%E4%BC%98%E5%8C%96/4-11%E6%8F%90%E5%8F%96%E5%85%AC%E5%85%B1%E4%BB%A3%E7%A0%81.html)
- [打包分析插件](https://www.npmjs.com/package/webpack-bundle-analyzer)