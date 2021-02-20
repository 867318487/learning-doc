# router
## 基本概念
通过Vue.use(VueRouter)和VueRouter构造函数==得到一个router的实例对象==，这个对象是一个全局对象。它包含了所有的路由以及许多关键的对象和属性。

## route
route是一个跳转的路由对象，每一个路由都会有一个route对象，是一个局部的对象。==$route对象表示当前的路由信息==，包含了当前 URL 解析得到的信息。包含当前的路径，参数，query对象等。

## 基本用法

```
import Router from 'vue-router'
Vue.use(Router)
const routes = [
   {
    path: '/student',
    name: 'student',
    component: Layout,
    meta: { title: '学生信息查询', icon: 'documentation', roles: ['student'] },
    children: [
      {
        path: 'info',
        component: () => import('@/views/student/info'),
        name: 'studentInfo',
        meta: { title: '信息查询', icon: 'form' }
      },
      {
        path: 'score',
        component: () => import('@/views/student/score'),
        name: 'studentScore',
        meta: { title: '成绩查询', icon: 'score' }
      }
    ]
  }
  ...
];
const router = new Router({
  mode: "history",//设置路由的模式
  routes,//配置当前的路由
});
new Vue({
    router,
    store,
    render: h => h(App)
}).$mount("#app");

```


## 动态路由
当使用路由参数时，例如从 /user/foo 导航到 /user/bar，原来的组件实例会被复用。因为两个路由都渲染同个组件，比起销毁再创建，复用则显得更加高效。不过，这也意味着组件的生命周期钩子不会再被调用。

复用组件时，想对路由参数的变化作出响应的话，你可以简单地 watch (监测变化) $route 对象：

```
const User = {
  template: '...',
  watch: {
    $route(to, from) {
      // 对路由变化作出响应...
    }
  }
}
```
或者使用 beforeRouteUpdate 导航守卫：

```
const User = {
  template: '...',
  beforeRouteUpdate (to, from, next) {
    // react to route changes...
    // don't forget to call next()
  }
}
```
## 命名视图
有时候想==同时 (同级) 展示多个视图，而不是嵌套展示==，例如创建一个布局，有 sidebar (侧导航) 和 main (主内容) 两个视图，这个时候命名视图就派上用场了。你可以在界面中拥有多个单独命名的视图，而不是只有一个单独的出口。如果 router-view 没有设置名字，那么默认为 default。

```
<!-- UserSettings.vue -->
<div>
  <h1>User Settings</h1>
  <NavBar/>
  <router-view/><!-- 没有设置名字，默认default -->
  <router-view name="helper"/>
</div>
```

```
{
  path: '/settings',
  // 你也可以在顶级路由就配置命名视图
  component: UserSettings,
  children: [{
    path: 'emails',
    component: UserEmailsSubscriptions
  }, {
    path: 'profile',
    components: {
      default: UserProfile,//对应没有设置名字的router-view
      helper: UserProfilePreview
    }
  }]
}
```



## 编程式导航
如果提供了 path，params 会被忽略。下面例子的做法，你需要提供路由的 name 或手写完整的带有参数的 path

```
const userId = '123'
router.push({ name: 'user', params: { userId }}) // -> /user/123
router.push({ path: `/user/${userId}` }) // -> /user/123
// 这里的 params 不生效，错误写法
router.push({ path: '/user', params: { userId }}) // -> /user
```
## 导航守卫
1. 导航被触发。
1. 在失活的组件里调用 beforeRouteLeave 守卫。
1. 调用全局的 beforeEach 守卫。
1. 在重用的组件里调用 beforeRouteUpdate 守卫 (2.2+)。
1. 在路由配置里调用 beforeEnter。
1. 解析异步路由组件。
1. 在被激活的组件里调用 beforeRouteEnter。
1. 调用全局的 beforeResolve 守卫 (2.5+)。
1. 导航被确认。
1. 调用全局的 afterEach 钩子。
1. 触发 DOM 更新。
1. 用创建好的实例调用 beforeRouteEnter 守卫中传给 next 的回调函数。

## 权限管理

```
//在路由中配置
const route = {
  /**
   * remote support 模块
   */
  path: '/remoteSupport',
  name: 'remoteSupport',
  component: RemoteSupport,
  meta: {
    title: 'Remote Support',
    inNavigator: true,
    svgIcon: 'remote',
    naviName: 'remoteSupport',
    permission: ['view:remoteSupport'],
  },
  children: [],
  、、、
}
```

```
//在路由守卫中判断
 //无权限访问的页面，跳转回首页
    if (to.meta.permission && !can(to.meta.permission)) {
        return '/'
    }

```



参考链接
- [VueRouter源码分析](https://juejin.im/post/6844903818203758600)
- [vue2.0中的$router 和 $route的区别](https://www.cnblogs.com/czy960731/p/9288830.html)
- [Vue-cli2.0中$router和$route的区别](https://juejin.im/post/6844903943449870350)
- [「前端进阶」彻底弄懂前端路由](https://juejin.im/post/6844903890278694919)
- [vue权限路由实现方式总结](https://juejin.im/post/6844903648057622536)