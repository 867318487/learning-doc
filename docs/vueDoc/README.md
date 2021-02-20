# vue源码
## 源码目录及准备工作
直接看链接
[Vue.js 技术揭秘/准备工作](https://ustbhuangyi.github.io/vue-analysis/v2/prepare/)
### 源码断点调试
//todo

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
## 深入响应式原理

参考文章
- [黄轶vue源码文档](https://ustbhuangyi.github.io/vue-analysis/)