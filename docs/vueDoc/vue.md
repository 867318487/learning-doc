# vue源码
## 源码目录及准备工作
直接看链接
[Vue.js 技术揭秘/准备工作](https://ustbhuangyi.github.io/vue-analysis/v2/prepare/)
### 源码断点调试
调试是在使用vue的项目里，不是在vue的源码项目中。

在项目中引入vue
```
import Vue from 'vue'
var app=new Vue({
    el:'#app',
    data:{
        message:'hello word!'
    }
})
```
正常情况下，对应引入的文件从node_modules中找
`node_modules/vue/package.json`
```
"module":"dist/vue.runtime.esm.js" //module指向的地址

```

webpack的配置

如果是compiler版本则会自动在配置文件中加上`vue`别名这一行定义。则当`import  vue`时，从以下路径中寻找。
```
resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {//定义的别名
      'vue': resolve('node_modules/vue/dist/vue.esm.js'),
      '@': resolve('src'),
    }
  },
```
打开`node_modules/vue/dist/vue.esm.js`，搜索init方法,加入断点。
```
function initMixin (Vue) {
  Vue.prototype._init = function (options) {
  
  debugger
  
    var vm = this;
    // a uid
    vm._uid = uid$3++;
    }
}
```


### Runtime Only VS Runtime + Compiler（版本介绍）
通常我们利用 vue-cli 去初始化我们的 Vue.js 项目的时候会询问我们用 Runtime Only 版本的还是 Runtime + Compiler 版本。

下面我们来对比这两个版本：
- Runtime Only
我们在使用 Runtime Only 版本的 Vue.js 的时候，通常需要借助如 webpack 的 vue-loader 工具把 .vue 文件编译成 JavaScript，因为是在编译阶段做的，所以它只包含运行时的 Vue.js 代码，因此代码体积也会更轻量。这个版本不支持.vue文件的写法。
- Runtime + Compiler
我们如果没有对代码做预编译，但又使用了 Vue 的 template 属性并传入一个字符串，则需要在客户端编译模板。目前项目使用这个版本。如下所示：

```
// 需要编译器的版本
new Vue({
  template: '<div>{{ hi }}</div>'
})

// 这种情况不需要
new Vue({
  render (h) {
    return h('div', this.hi)
  }
})
```
> 因为在 Vue.js 2.0 中，最终渲染都是通过 render 函数，如果写 template 属性，则需要编译成 render 函数，那么这个编译过程会发生运行时，所以需要带有编译器的版本。

### 疑问
1. nodemodule中的vue文件目录和源码中文件目录的那些代码有什么关系


## 数据驱动
### new vue发生了什么
Vue 实际上是一个类，类在 Javascript 中是用 Function 来实现的，来看一下源码，在`src/core/instance/index.js` 中。

```
function Vue (options) {
  // ...
  this._init(options)
}
```
然后会调用 `this._init` 方法， 该方法在 `src/core/instance/init.js` 中定义。

```
Vue.prototype._init = function (options?: Object) {
   // ...
 
  // merge options 合并配置
  if (options && options._isComponent) {
   // ...
  } else {
    vm.$options = mergeOptions(
      resolveConstructorOptions(vm.constructor),
      options || {},
      vm
    )
  }
  /* istanbul ignore else */
  if (process.env.NODE_ENV !== 'production') {
    initProxy(vm)
  } else {
    vm._renderProxy = vm
  }
  // 初始化生命周期，初始化事件中心，初始化渲染，初始化 data、props、computed、watcher 等等
  vm._self = vm
  initLifecycle(vm)
  initEvents(vm)
  initRender(vm)
  callHook(vm, 'beforeCreate')
  initInjections(vm) // resolve injections before data/props
  initState(vm)
  initProvide(vm) // resolve provide after data/props
  callHook(vm, 'created')

   // ...
  if (vm.$options.el) {
    vm.$mount(vm.$options.el) //挂载
  }
}
```
> + Vue 初始化主要就干了几件事情，合并配置，初始化生命周期，初始化事件中心，初始化渲染，初始化 data、props、computed、watcher 等等。
> + 在初始化的最后，检测到如果有 el 属性，则调用 vm.$mount 方法挂载 vm，挂载的目标就是把模板渲染成最终的 DOM，那么接下来我们来分析 Vue 的挂载过程。

### vue实例挂载实现
Vue 中我们是通过 `$mount` 实例方法去挂载 `vm` 的，`$mount` 方法在多个文件中都有定义，因为 `$mount` 这个方法的实现是和平台、构建方式都相关的。
- src/platform/web/entry-runtime-with-compiler.js --仅在compiler 版本存在
- src/platform/web/runtime/index.js     --web端
- src/platform/weex/runtime/index.js    --weex

`compiler` 版本的 `$mount` 实现非常有意思，先来看一下 `src/platform/web/entry-runtime-with-compiler.js` 文件中定义：

```
/*1、缓存了原型上的 $mount 方法，再重新定义该方法*/
const mount = Vue.prototype.$mount 
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && query(el)

  /*2、对el做限制*/
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }
  const options = this.$options
  /*3、把 el 或者 template 字符串转换成 render 方法 */
  if (!options.render) {
    let template = options.template
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) {
        template = template.innerHTML
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) {
      template = getOuterHTML(el)
    }
    if (template) {
         // ...
        /*在线编译过程，返回render函数 */
      const { render, staticRenderFns } = compileToFunctions(template, {
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
       // ...
    }
  }
  /*4、最后调用原型上的$mount挂载 */
  return mount.call(this, el, hydrating)
}
```
> 1. 首先缓存了原型上的 $mount 方法，再重新定义该方法，我们先来分析这段代码。
> 2. 对 el 做了限制，Vue 不能挂载在 body、html 这样的根节点上。
> 3. 把 el 或者 template 字符串转换成 render 方法。这里我们要牢记，在 Vue 2.0 版本中，所有 Vue 的组件的渲染最终都需要 render 方法，无论我们是用单文件 .vue 方式开发组件，还是写了 el 或者 template 属性，最终都会转换成 render 方法，那么这个过程是 Vue 的一个“在线编译”的过程，它是调用 compileToFunctions 方法实现的，编译过程我们之后会介绍。
> 4. 最后调用原先原型上的 $mount 方法挂载。

原先原型上的 $mount 方法在 `src/platform/web/runtime/index.js` 中定义,因为它可以被 `runtime only` 版本的 Vue 直接使用的。

```
// public mount method
Vue.prototype.$mount = function (
  el?: string | Element, /*表示挂载的元素，可以是字符串，也可以是 DOM 对象*/
  hydrating?: boolean, /*和服务端渲染相关 */
): Component {
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el, hydrating)
}
```
`$mount` 方法实际上会去调用 `mountComponent` 方法，这个方法定义在 `src/core/instance/lifecycle.js` 文件中：

```
export function mountComponent (
  vm: Component,
  el: ?Element,
  hydrating?: boolean
): Component {
  vm.$el = el
  if (!vm.$options.render) {
    vm.$options.render = createEmptyVNode

    /* 一些警告及错误提示 */
     // ...
    
  }
  callHook(vm, 'beforeMount')

  let updateComponent
  /* 调用 vm._render 方法先生成虚拟 Node，最终调用 vm._update 更新 DOM */
  if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
    updateComponent = () => {
      const name = vm._name
      const id = vm._uid
      const startTag = `vue-perf-start:${id}`
      const endTag = `vue-perf-end:${id}`

      mark(startTag)
      const vnode = vm._render()
      mark(endTag)
      measure(`vue ${name} render`, startTag, endTag)

      mark(startTag)
      vm._update(vnode, hydrating)
      mark(endTag)
      measure(`vue ${name} patch`, startTag, endTag)
    }
  } else {
    updateComponent = () => {
      vm._update(vm._render(), hydrating)
    }
  }

 //实例化一个渲染watcher
  new Watcher(vm, updateComponent, noop, {
    before () {
      if (vm._isMounted) {
        callHook(vm, 'beforeUpdate')
      }
    }
  }, true /* isRenderWatcher */)
  hydrating = false


  if (vm.$vnode == null) {
    vm._isMounted = true
    callHook(vm, 'mounted')
  }
  return vm
}

```
mountComponent 核心
> + 先实例化一个渲染Watcher，在它的回调函数中会调用 updateComponent 方法。
> + 在此方法中调用 vm._render 方法先生成虚拟 Node，最终调用 vm._update 更新 DOM。

Watcher 在这里起到两个作用
> 1. 一个是初始化的时候会执行回调函数
> 2. 另一个是当 vm实例中的监测的数据发生变化的时候执行回调函数

### render
Vue 的` _render` 方法是实例的一个私有方法，用来把实例渲染成一个`V Node`。它的定义在 src/core/instance/render.js 文件中：

```
Vue.prototype._render = function (): VNode {
  const vm: Component = this
  const { render, _parentVnode } = vm.$options

  // ...

  vm.$vnode = _parentVnode
  // render self
  let vnode
  try {
    //重点
    vnode = render.call(vm._renderProxy, vm.$createElement)
  } catch (e) {
    handleError(e, vm, `render`)
     // ...
  }
  // return empty vnode in case the render function errored out
  if (!(vnode instanceof VNode)) {
     // ...
    vnode = createEmptyVNode()
  }
  // set parent
  vnode.parent = _parentVnode
  return vnode
}
```
#### 总结
> vm._render 最终是通过执行 createElement 方法并返回的是 vnode，它是一个虚拟 Node。

### Virtual DOM
VNode 是对真实 DOM 的一种抽象描述，它的核心定义无非就几个关键属性，标签名、数据、子节点、键值等，其它属性都是用来扩展 VNode 的灵活性以及实现一些特殊 feature 的。由于 VNode 只是用来映射到真实 DOM 的渲染，不需要包含操作 DOM 的方法，因此它是非常轻量和简单的。

#### createElement
Vue.js 利用 createElement 方法创建 VNode，它定义在 src/core/vdom/create-elemenet.js 中

```
export function createElement (
  context: Component,
  tag: any,
  data: any,
  children: any,
  normalizationType: any,
  alwaysNormalize: boolean
): VNode | Array<VNode> {
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children
    children = data
    data = undefined
  }
  if (isTrue(alwaysNormalize)) {
    normalizationType = ALWAYS_NORMALIZE
  }
  /* 初始化状态 */
  return _createElement(context, tag, data, children, normalizationType)
}
```
真正创建 VNode 的函数 _createElement

```
export function _createElement (
  context: Component,
  tag?: string | Class<Component> | Function | Object,
  data?: VNodeData,
  children?: any,
  normalizationType?: number
): VNode | Array<VNode> {
  if (isDef(data) && isDef((data: any).__ob__)) {
    process.env.NODE_ENV !== 'production' && warn(
      `Avoid using observed data object as vnode data: ${JSON.stringify(data)}\n` +
      'Always create fresh vnode data objects in each render!',
      context
    )
    return createEmptyVNode()
  }
  
  // ... 状态判断
  
  /*1、 children的规范化 */
  if (normalizationType === ALWAYS_NORMALIZE) {
    children = normalizeChildren(children)//重点
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children) //重点
  }
  
  /* 2、创建VNode实例 */
  let vnode, ns
  if (typeof tag === 'string') {
    let Ctor
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
    if (config.isReservedTag(tag)) {//内置节点
      // 创建普通VNode
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      )
    } else if (isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {//已注册的组件名
      // 创建一个组件类型的VNode
      vnode = createComponent(Ctor, data, context, children, tag)
    } else {//否则创建一个未知标签的VNode
      vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      )
    }
  } else {
    //如果是 tag 一个 Component 类型，则直接调用 createComponent 创建一个组件类型的 VNode 节点。
    vnode = createComponent(tag, data, context, children)
  }
  
  if (Array.isArray(vnode)) {
    return vnode
  } else if (isDef(vnode)) {
    if (isDef(ns)) applyNS(vnode, ns)
    if (isDef(data)) registerDeepBindings(data)
    return vnode
  } else {
    return createEmptyVNode()
  }
}
```
_createElement 方法有 5 个参数：
+ context 表示 VNode 的上下文环境，它是 Component 类型；
+ tag 表示标签，它可以是一个字符串，也可以是一个 Component；data 表示 VNode 的数据，它是一个 VNodeData 类型；
+ children 表示当前 VNode 的子节点，它是任意类型的，它接下来需要被规范为标准的 VNode 数组；
+ normalizationType 表示子节点规范的类型，类型不同规范的方法也就不一样，它主要是参考 render 函数是编译生成的还是用户手写的。

children 的规范化以及 VNode 的创建
+ simpleNormalizeChildren 方法调用场景是 render 函数是编译生成的。理论上编译生成的 children 都已经是 VNode 类型的，但这里有一个例外，就是 functional component 函数式组件返回的是一个数组而不是一个根节点，所以会通过 Array.prototype.concat 方法把整个 children 数组打平，让它的深度只有一层。
+ normalizeArrayChildren 主要的逻辑就是遍历 children，获得单个节点 c，然后对 c 的类型判断，如果是一个数组类型，则递归调用 normalizeArrayChildren; 如果是基础类型，则通过 createTextVNode 方法转换成 VNode 类型；否则就已经是 VNode 类型了，如果 children 是一个列表并且列表还存在嵌套的情况，则根据 nestedIndex 去更新它的 key。
+ 经过对 children 的规范化，children 变成了一个类型为 VNode 的 Array。

#### 总结：
> createElement 创建 VNode 的过程，每个 VNode 有 children，children 每个元素也是一个 VNode，这样就形成了一个 VNode Tree，它很好的描述了我们的 DOM Tree。
回到 mountComponent 函数的过程，我们已经知道 vm._render 是如何创建了一个 VNode，接下来就是要把这个 VNode 渲染成一个真实的 DOM 并渲染出来，这个过程是通过 vm._update 完成的，接下来分析一下这个过程。


### update
Vue 的 _update 是实例的一个私有方法，它被调用的时机有 2 个，一个是首次渲染，一个是数据更新的时候；

这一章节只分析首次渲染部分。_update 方法的作用是把 VNode 渲染成真实的 DOM，它的定义在 `src/core/instance/lifecycle.js` 中：

```
Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
  // ...
  
  if (!prevVnode) {
    // initial render
    vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
  } else {
    // updates
    vm.$el = vm.__patch__(prevVnode, vnode)
  }
  
  //...
  
}

```
`_update `的核心就是调用` vm.__patch__` 方法，该方法实际上在不同的平台，比如 web 和 weex 上的定义不同，在 web 平台中它的定义在 src/platforms/web/runtime/index.js 中：

```
Vue.prototype.__patch__ = inBrowser ? patch : noop
```
在web平台上，服务端渲染没有真实的浏览器DOM环境，不需要把VNode转换成DOM，所以是一个空函数。在浏览器渲染中，指向了patch方法，他的定义在`src/platforms/web/runtime/patch.js`中：

```
import * as nodeOps from 'web/runtime/node-ops'
//...

const modules = platformModules.concat(baseModules)

//通过函数科里化，先把差异磨平
export const patch: Function = createPatchFunction({ nodeOps, modules })
```
该方法的定义是调用 `createPatchFunction` 方法的返回值，这里传入了一个对象，包含 `nodeOps` 参数和 `modules` 参数。 createPatchFunction 的实现，定义在` src/core/vdom/patch.js `中：

```
const hooks = ['create', 'activate', 'update', 'remove', 'destroy']

export function createPatchFunction (backend) {
  let i, j
  const cbs = {}

  const { modules, nodeOps } = backend
  
  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = []
    for (j = 0; j < modules.length; ++j) {
      if (isDef(modules[j][hooks[i]])) {
        cbs[hooks[i]].push(modules[j][hooks[i]])
      }
    }
  }

  // ...
  /*  返回一个path方法，差异化已经磨平 */
  return function patch (oldVnode, vnode, hydrating, removeOnly) {
    if (isUndef(vnode)) {
      if (isDef(oldVnode)) invokeDestroyHook(oldVnode)
      return
    }

    let isInitialPatch = false
    const insertedVnodeQueue = []

    if (isUndef(oldVnode)) {
      // empty mount (likely as component), create new root element
      isInitialPatch = true
      createElm(vnode, insertedVnodeQueue)
    } else {
      const isRealElement = isDef(oldVnode.nodeType)
      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        // patch existing root node
        patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly)
      } else {
        if (isRealElement) {//是否真实的dom节点
          if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
            oldVnode.removeAttribute(SSR_ATTR)
            hydrating = true
          }
          if (isTrue(hydrating)) {
            if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
              invokeInsertHook(vnode, insertedVnodeQueue, true)
              return oldVnode
            } else if (process.env.NODE_ENV !== 'production') {
              warn(
                'The client-side rendered virtual DOM tree is not matching ' +
                'server-rendered content. This is likely caused by incorrect ' +
                'HTML markup, for example nesting block-level elements inside ' +
                '<p>, or missing <tbody>. Bailing hydration and performing ' +
                'full client-side render.'
              )
            }
          }
         //通过 emptyNodeAt 方法把 oldVnode 转换成 VNode 对象
          oldVnode = emptyNodeAt(oldVnode)
        }

        // 替换当前的节点
        const oldElm = oldVnode.elm
        const parentElm = nodeOps.parentNode(oldElm)

        // 调用 createElm 方法 create new node
        createElm(
          vnode,
          insertedVnodeQueue,
          oldElm._leaveCb ? null : parentElm,
          nodeOps.nextSibling(oldElm)
        )

        // update parent placeholder node element, recursively
        if (isDef(vnode.parent)) {
          let ancestor = vnode.parent
          const patchable = isPatchable(vnode)
          while (ancestor) {
            for (let i = 0; i < cbs.destroy.length; ++i) {
              cbs.destroy[i](ancestor)
            }
            ancestor.elm = vnode.elm
            if (patchable) {
              for (let i = 0; i < cbs.create.length; ++i) {
                cbs.create[i](emptyNode, ancestor)
              }
              // #6513
              // invoke insert hooks that may have been merged by create hooks.
              // e.g. for directives that uses the "inserted" hook.
              const insert = ancestor.data.hook.insert
              if (insert.merged) {
                // start at index 1 to avoid re-invoking component mounted hook
                for (let i = 1; i < insert.fns.length; i++) {
                  insert.fns[i]()
                }
              }
            } else {
              registerRef(ancestor)
            }
            ancestor = ancestor.parent
          }
        }

        // destroy old node
        if (isDef(parentElm)) {
          removeVnodes(parentElm, [oldVnode], 0, 0)
        } else if (isDef(oldVnode.tag)) {
          invokeDestroyHook(oldVnode)
        }
      }
    }

    invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)
    return vnode.elm
  }
}
```
这里用到了一**个函数柯里化**的技巧，通过 `createPatchFunction` 把差异化参数提前固化，这样不用每次调用 `patch` 的时候都传递 `nodeOps` 和 `modules` 了，这种编程技巧也非常值得学习。

回到` patch `方法本身，它接收 4个参数:
- `oldVnode` 表示旧的 `VNode` 节点，它也可以不存在或者是一个 `DOM` 对象；
- `vnode` 表示执行 `_render` 后返回的` VNode` 的节点；
- `hydrating` 表示是否是服务端渲染；
- `removeOnly` 是给 `transition-group` 用的，之后会介绍。

> createPatchFunction 内部定义了一系列的辅助方法，最终返回了一个 patch 方法，这个方法就赋值给了 vm._update 函数里调用的 vm.__patch__。






## 组件化
### createComponent
上一章我们在分析 createElement 的实现的时候，它最终会调用 _createElement 方法，其中有一段逻辑是对参数 tag 的判断，如果是一个普通的 html 标签，像上一章的例子那样是一个普通的 div，则会实例化一个普通 VNode 节点，否则通过 createComponent 方法创建一个组件 VNode。
`src/core/vdom/create-element.js`中的`_createElement`方法

```
export function _createElement(){
    //...
    if (typeof tag === 'string') {
      //...
    } else {
      // direct component options / constructor
      vnode = createComponent(tag, data, context, children)
    }
}
```
这一章传入的是一个 `App` 对象，它本质上是一个 `Component` 类型，那么它会走到上述代码的 `else `逻辑，直接通过 `createComponent` 方法来创建 `vnode`。它定义在 `src/core/vdom/create-component.js` 文件中：

```
export function createComponent (
  Ctor: Class<Component> | Function | Object | void,
  data: ?VNodeData,
  context: Component,
  children: ?Array<VNode>,
  tag?: string
): VNode | Array<VNode> | void {
  //...
  
  //1、构造子类构造函数
  const baseCtor = context.$options._base

  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor)//baseCtor 实际上就是 Vue
  }

  //...

  //2、安装钩子函数
  installComponentHooks(data)

  //3、实例化 VNode
  const name = Ctor.options.name || tag
  const vnode = new VNode(
    `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
    data, undefined, undefined, undefined, context,
    { Ctor, propsData, listeners, tag, children },
    asyncFactory
  )

  //...

  return vnode
}
```
#### 构造子类构造函数
```
 //1、构造子类构造函数
  const baseCtor = context.$options._base

  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor)//baseCtor 实际上就是 Vue
  }
```
这一步有2个地方要注意
- `baseCtor` 实际上就是 `Vue`，这个的定义是在最开始初始化 `Vue` 的阶段定义了`Vue.options._base = Vue`,在`_init` 函数中通过`mergeOptions`把 `Vue` 上的一些` option` 扩展到了` vm.$options `上，所以我们也就能通过 `vm.$options._base `拿到 `Vue` 这个构造函数了。
- `Vue.extend` 的作用就是构造一个 `Vue` 的子类，它使用一种非常经典的`原型继承`的方式把一个纯对象转换一个继承于 `Vue` 的构造器` Sub` 并返回，然后对 `Sub` 这个对象本身扩展了一些属性，如扩展 `options`、添加全局 API 等；并且对配置中的 `props` 和 `computed` 做了初始化工作；最后对于这个 Sub 构造函数做了缓存，避免多次执行 Vue.extend 的时候对同一个子组件重复构造。

我们来看一下` Vue.extend `函数的定义，在 `src/core/global-api/extend.js `中。
```
Vue.extend = function (extendOptions: Object): Function {
  extendOptions = extendOptions || {}
  const Super = this
  const SuperId = Super.cid
  const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
  
  //避免重复构造
  if (cachedCtors[SuperId]) {
    return cachedCtors[SuperId]
  }

  //通过原型继承
  Sub.prototype = Object.create(Super.prototype)
  Sub.prototype.constructor = Sub
  Sub.cid = cid++
  //扩展options
  Sub.options = mergeOptions(
    Super.options,
    extendOptions
  )
  Sub['super'] = Super

  if (Sub.options.props) {//初始化props
    initProps(Sub)
  }
  if (Sub.options.computed) {//初始化computed
    initComputed(Sub)
  }
  //...

  // cache constructor
  cachedCtors[SuperId] = Sub  //缓存构造函数
  return Sub
}
```
#### 安装组件钩子函数

```
// install component management hooks onto the placeholder node
installComponentHooks(data)
```

```
const hooksToMerge = Object.keys(componentVNodeHooks) //当前组件的生命周期钩子

function installComponentHooks (data: VNodeData) {
const componentVNodeHooks = {
   //init在patch的时候会用到
  init (vnode: VNodeWithData, hydrating: boolean): ?boolean {
    if (
      vnode.componentInstance &&
      !vnode.componentInstance._isDestroyed &&
      vnode.data.keepAlive
    ) {
      // kept-alive components, treat as a patch
      const mountedNode: any = vnode // work around flow
      componentVNodeHooks.prepatch(mountedNode, mountedNode)
    } else {
      const child = vnode.componentInstance = createComponentInstanceForVnode(
        vnode,
        activeInstance
      )
      child.$mount(hydrating ? vnode.elm : undefined, hydrating)
    }
  },

}

//...
  const hooks = data.hook || (data.hook = {})
  for (let i = 0; i < hooksToMerge.length; i++) {//循环组件的钩子数组
    const key = hooksToMerge[i]
    const existing = hooks[key] //以有的钩子
    const toMerge = componentVNodeHooks[key] //组件的钩子
    if (existing !== toMerge && !(existing && existing._merged)) {//合并钩子
      hooks[key] = existing ? mergeHook(toMerge, existing) : toMerge
    }
  }
  
  //...
}
```
整个 `installComponentHooks` 的过程就是把 `componentVNodeHooks` 的钩子函数合并到 `data.hook` 中，在 `VNode` 执行 `patch` 的过程中执行相关的钩子函数，具体的执行我们稍后在介绍 `patch` 过程中会详细介绍。这里要注意的是合并策略，在合并过程中，如果某个时机的钩子已经存在 `data.hook` 中，那么通过执行 `mergeHook` 函数做合并，这个逻辑很简单，就是在最终执行的时候，依次执行这两个钩子函数即可。

#### 实例化 VNode

```
const name = Ctor.options.name || tag
const vnode = new VNode(
  `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
  data, undefined, undefined, undefined, context,
  { Ctor, propsData, listeners, tag, children },
  asyncFactory
)
return vnode
```
通过 `new VNode` 实例化一个 `vnode` 并返回。需要注意的是和普通元素节点的` vnode` 不同，组件的 `vnode `是没有` children `的，这点很关键，在之后的` patch` 过程中我们会再提。

总结：
>在渲染一个组件的时候的 3 个关键逻辑：构造子类构造函数，安装组件钩子函数和实例化 `vnode`。`createComponent` 后返回的是组件 `vnode`，它也一样走到 vm._update 方法，进而执行了 `patch` 函数，

### patch
patch 的过程会调用 createElm 创建元素节点
它的定义在 `src/core/vdom/patch.js` 中

```
function createElm (
  vnode,
  insertedVnodeQueue,
  parentElm,
  refElm,
  nested,
  ownerArray,
  index
) {
  // ...
  if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
    return
  }
  // ...
}
```
这里会判断 `createComponent(vnode, insertedVnodeQueue, parentElm, refElm) `的返回值，如果为 true 则直接结束，那么接下来看一下 createComponent 方法的实现：

```
function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
  let i = vnode.data
  if (isDef(i)) {
    //...
    if (isDef(i = i.hook) && isDef(i = i.init)) {
      i(vnode, false /* hydrating */)
    }
    //...
    if (isDef(vnode.componentInstance)) {
      initComponent(vnode, insertedVnodeQueue)
      insert(parentElm, vnode.elm, refElm)
      if (isTrue(isReactivated)) {
        reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm)
      }
      return true
    }
  }
}
```
如果 vnode 是一个组件 VNode，那么条件会满足，并且得到 i 就是 init 钩子函数，回顾上节我们在创建组件 VNode 的时候合并钩子函数中就包含 init 钩子函数，定义在 src/core/vdom/create-component.js 中：

```
init (vnode: VNodeWithData, hydrating: boolean): ?boolean {
  if (
    vnode.componentInstance &&
    !vnode.componentInstance._isDestroyed &&
    vnode.data.keepAlive
  ) {
    //...
  } else {
  //创建一个vue实例
    const child = vnode.componentInstance = createComponentInstanceForVnode(
      vnode,
      activeInstance
    )
    //挂载子组件
    child.$mount(hydrating ? vnode.elm : undefined, hydrating)
  }
},
```
init 钩子函数执行也很简单，它是通过 `createComponentInstanceForVnode `创建一个` Vue` 的实例，然后调用` $mount `方法挂载子组件， 先来看一下 `createComponentInstanceForVnode `的实现：

```
export function createComponentInstanceForVnode (
  vnode: any, // we know it's MountedComponentVNode but flow doesn't
  parent: any, // activeInstance in lifecycle state
): Component {
  const options: InternalComponentOptions = {
    _isComponent: true,
    _parentVnode: vnode,
    parent
  }
  // check inline-template render functions
  const inlineTemplate = vnode.data.inlineTemplate
  if (isDef(inlineTemplate)) {
    options.render = inlineTemplate.render
    options.staticRenderFns = inlineTemplate.staticRenderFns
  }
  return new vnode.componentOptions.Ctor(options)
}
```
`createComponentInstanceForVnode` 函数构造的一个内部组件的参数，然后执行 `new vnode.componentOptions.Ctor(options)`。这里的 `vnode.componentOptions.Ctor` 对应的就是子组件的构造函数，我们上一节分析了它实际上是继承于 `Vue` 的一个构造器 `Sub`，相当于 `new Sub(options)` 这里有几个关键参数要注意几个点，`_isComponent `为 `true` 表示它是一个组件，`parent` 表示当前激活的组件实例。

所以子组件的实例化实际上就是在这个时机执行的，并且它会执行实例的` _init` 方法，这个过程有一些和之前不同的地方需要挑出来说，代码在 src/core/instance/init.js 中：

```
Vue.prototype._init = function (options?: Object) {
  const vm: Component = this
  // 合并options
  if (options && options._isComponent) {
     //组件走到这里
    initInternalComponent(vm, options)
  } else {
    //...
  }
  // ...
  if (vm.$options.el) {
    vm.$mount(vm.$options.el)
  } 
}
```
这里首先是合并 options 的过程有变化，`_isComponent` 为 true，所以走到了 `initInternalComponent` 过程，这个函数的实现也简单看一下：

```
export function initInternalComponent (vm: Component, options: InternalComponentOptions) {
  const opts = vm.$options = Object.create(vm.constructor.options)
  // doing this because it's faster than dynamic enumeration.
  const parentVnode = options._parentVnode
  opts.parent = options.parent  //合并
  opts._parentVnode = parentVnode  //合并

  const vnodeComponentOptions = parentVnode.componentOptions
  opts.propsData = vnodeComponentOptions.propsData
  opts._parentListeners = vnodeComponentOptions.listeners
  opts._renderChildren = vnodeComponentOptions.children
  opts._componentTag = vnodeComponentOptions.tag

  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}
```
这个过程我们重点记住以下几个点即可：`opts.parent = options.parent、opts._parentVnode = parentVnode`，它们是把之前我们通过 `createComponentInstanceForVnode` 函数传入的几个参数合并到内部的选项 $options 里了。

再来看一下 _init 函数最后执行的代码：

```
if (vm.$options.el) {
   vm.$mount(vm.$options.el)
}
```
由于组件初始化的时候是不传` el` 的，因此组件是自己接管了 $mount 的过程，这个过程的主要流程在上一章介绍过了，回到组件 `init` 的过程`，componentVNodeHooks` 的 `init` 钩子函数，在完成实例化的 `_init` 后，接着会执行 `child.$mount(hydrating ? vnode.elm : undefined, hydrating)` 。这里 `hydrating `为 `true` 一般是服务端渲染的情况，我们只考虑客户端渲染，所以这里 `$mount` 相当于执行` child.$mount(undefined, false)`，它最终会调用 `mountComponent `方法，进而执行 `vm._render() `方法：

##### 执行 `vm._render() `方法

```
Vue.prototype._render = function (): VNode {
  const vm: Component = this
  const { render, _parentVnode } = vm.$options

  vm.$vnode = _parentVnode
 
  let vnode
  try {
    vnode = render.call(vm._renderProxy, vm.$createElement)
  } catch (e) {
    // ...
  }
 //关键步骤，设置父子关系
  vnode.parent = _parentVnode
  return vnode
}
```
`render` 函数生成的 `vnode ` 的 `parent` 指向了 `_parentVnode`。

##### 执行 `vm._update` 去渲染`VNode`
了。来看一下组件渲染的过程中有哪些需要注意的，`vm._update` 的定义在 `src/core/instance/lifecycle.js `中：

```
export let activeInstance: any = null
Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
  const vm: Component = this
  const prevEl = vm.$el
  const prevVnode = vm._vnode
  const prevActiveInstance = activeInstance
  activeInstance = vm
  vm._vnode = vnode //1、这个 vnode 是通过 vm._render() 返回的组件渲染 VNode

  if (!prevVnode) {
    // initial render
    vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
  } else {
    // updates
    vm.$el = vm.__patch__(prevVnode, vnode)
  }
  activeInstance = prevActiveInstance
  // update __vue__ reference
  if (prevEl) {
    prevEl.__vue__ = null
  }
  if (vm.$el) {
    vm.$el.__vue__ = vm
  }
  // if parent is an HOC, update its $el as well
  if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
    vm.$parent.$el = vm.$el
  }
  // updated hook is called by the scheduler to ensure that children are
  // updated in a parent's updated hook.
}
```
1. `vm._vnode = vnode `的逻辑，这个 `vnode` 是通过` vm._render() `返回的组件渲染 `VNode`，`vm._vnode` 和 `vm.$vnode` 的关系就是一种父子关系，用代码表达就是 `vm._vnode.parent === vm.$vnode`。
2. 这个` activeInstance `作用就是保持当前上下文的 Vue 实例，它是在` lifecycle `模块的全局变量，定义是 `export let activeInstance: any = null`，并且在之前我们调用 `createComponentInstanceForVnode `方法的时候从 `lifecycle` 模块获取，并且作为参数传入的。
3. 在 `vm._update `的过程中，把当前的 vm 赋值给 `activeInstance`，同时通过 `const prevActiveInstance = activeInstance` 用 `prevActiveInstance `保留上一次的 `activeInstance`。实际上，`prevActiveInstance` 和当前的 vm 是一个父子关系，当一个 vm 实例完成它的所有子树的 patch 或者 update 过程后，activeInstance 会回到它的父实例，这样就完美地保证了 `createComponentInstanceForVnode` 整个深度遍历过程中，我们在实例化子组件的时候能传入当前子组件的父 Vue 实例，并在` _init `的过程中，通过 `vm.$parent` 把这个父子关系保留。
4. 最后就是调用 __patch__ 渲染 VNode

```
vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
 
function patch (oldVnode, vnode, hydrating, removeOnly) {
  // ...
  let isInitialPatch = false
  const insertedVnodeQueue = []

  if (isUndef(oldVnode)) {
    // empty mount (likely as component), create new root element
    isInitialPatch = true
    createElm(vnode, insertedVnodeQueue)
  } else {
    // ...
  }
  // ...
}
```
注意，这里我们传入的 vnode 是组件渲染的 vnode，也就是我们之前说的 `vm._vnode`，如果组件的根节点是个普通元素，那么` vm._vnode` 也是普通的 vnode，这里 `createComponent(vnode, insertedVnodeQueue, parentElm, refElm)` 的返回值是 false。接下来的过程就和我们上一章一样了，先创建一个父节点占位符，然后再遍历所有子 VNode 递归调用 createElm，在遍历的过程中，如果遇到子 VNode 是一个组件的 VNode，则重复本节开始的过程，这样通过一个递归的方式就可以完整地构建了整个组件树。在完成组件的整个 patch 过程后，最后执行 insert(parentElm, vnode.elm, refElm) 完成组件的 DOM 插入，如果组件 patch 过程中又创建了子组件，那么DOM 的插入顺序是先子后父。

总结：
> 那么到此，一个组件的 VNode 是如何创建、初始化、渲染的过程也就介绍完毕了。在对组件化的实现有一个大概了解后，接下来我们来介绍一下这其中的一些细节。我们知道编写一个组件实际上是编写一个 JavaScript 对象，对象的描述就是各种配置，之前我们提到在 _init 的最初阶段执行的就是 merge options 的逻辑。

### 合并配置
`new Vue `的过程通常有 2 种场景，一种是外部我们的代码主动调用` new Vue(options)` 的方式实例化一个 `Vue` 对象；另一种是我们上一节分析的组件过程中内部通过 `new Vue(options) `实例化子组件。
无论哪种场景，都会执行实例的` _init(options)` 方法，它首先会执行一个` merge options `的逻辑，相关的代码在 `src/core/instance/init.js` 中：

```
Vue.prototype._init = function (options?: Object) {
  // merge options
  if (options && options._isComponent) {
    initInternalComponent(vm, options)
  } else {
    vm.$options = mergeOptions(
      resolveConstructorOptions(vm.constructor),
      options || {},
      vm
    )
  }
  // ...
}
```
#### 外部调用场景
当执行 new Vue 的时候，在执行 this._init(options) 的时候，就会执行如下逻辑去合并 options：

```
vm.$options = mergeOptions(
  resolveConstructorOptions(vm.constructor),
  options || {},
  vm
)
```
这里通过调用` mergeOptions `方法来合并，它实际上就是把 `resolveConstructorOptions(vm.constructor) `的返回值和 `options `做合并，`resolveConstructorOptions` 的实现先不考虑，在我们这个场景下，它还是简单返回 `vm.constructor.options`，相当于 `Vue.options`。

那么回到` mergeOptions `这个函数，它的定义在 `src/core/util/options.js `中：

```
/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 */
export function mergeOptions (
  parent: Object,
  child: Object,
  vm?: Component
): Object {
  //...
  normalizeProps(child, vm)
  normalizeInject(child, vm)
  normalizeDirectives(child)
  const extendsFrom = child.extends
  if (extendsFrom) {//1、递归把extends合并到parent上
    parent = mergeOptions(parent, extendsFrom, vm)
  }
  if (child.mixins) {//2、递归把mixins合并到parent上
    for (let i = 0, l = child.mixins.length; i < l; i++) {
      parent = mergeOptions(parent, child.mixins[i], vm)
    }
  }
  const options = {}
  let key
  for (key in parent) {//3、遍历parent，调用mergeField
    mergeField(key)
  }
  for (key in child) {//4、遍历child，如果key不在parent的自身属性上，调用mergefield
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
  }
  function mergeField (key) {
    const strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key)
  }
  return options
}
```
mergeOptions 主要功能就是把 parent 和 child 这两个对象根据一些合并策略，合并成一个新对象并返回。比较核心的几步：
1. 先递归把 extends 和 mixins 合并到 parent 上。
2. 遍历 parent，调用 mergeField。
3. 遍历 child，如果 key 不在 parent 的自身属性上，则调用 mergeField。

mergeField 函数合并策略

mergeOptions 函数，一旦 parent 和 child都定义了相同的钩子函数，那么它们会把 2 个钩子函数合并成一个数组。

#### 组件场景
组件的构造函数是通过 Vue.extend 继承自 Vue 的，先回顾一下这个过程，代码定义在 src/core/global-api/extend.js 中。

```
Vue.extend = function (extendOptions: Object): Function {
  // ...
  Sub.options = mergeOptions(
    Super.options,  //Vue.options
    extendOptions  //前面定义的组件对象
  )
  //...
  Sub.superOptions = Super.options
  Sub.extendOptions = extendOptions
  Sub.sealedOptions = extend({}, Sub.options)

  // ...
  return Sub
}
```
总结：
> 我们需要知道对于 options 的合并有 2 种方式，子组件初始化过程通过 initInternalComponent 方式要

## 深入响应式原理

参考文章
- [黄轶vue源码文档](https://ustbhuangyi.github.io/vue-analysis/)