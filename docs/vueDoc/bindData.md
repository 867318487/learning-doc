
# vue双向绑定
## 介绍
vue.js是采用的数据劫持结合发布者-订阅者模式的方式,通过object.defineProperty()来劫持各个属性的setter/getter 在数据变动时,发布消息给订阅者,触发相应的监听回调 。
### 具体步骤

1. 需要observe(观察者)的数据对象进行遍历,包括子属性对象的属性,都加上setter和getter,这样的话, 给这个对象的某个值赋值,就会触发setter,那么就能监听到数据的变化 。
1. compile(解析)解析模版指令,将模版中的变量替换成数据,然后初始化渲染页面视图,并将每个指令对应的节点绑定更新函数, 添加监听数据的订阅者,一旦数据有变动,收到通知,更新视图 。
1. watcher(订阅者)是observer和compile之间通信的桥梁,主要做的事情是 
   - 在实例化时往属性订阅器(dep)里面添加自己 。
   -  自身必须有一个update()方法 。
   -  待属性变动dep.notice()通知时,能够调用自身的update()方法,并触发compile中绑定的回调。
4. mvvm作为数据绑定的入口,整合observer,compile和watcher来监听自己的model数据变化,通过compile来解析编译模版, 最终利用watcher搭起observer和compile之间的通信桥梁,达到数据变化->更新视图:视图交互变化->数据model变更的双向绑定效果。
### 简化版
1. 第一步：组件初始化的时候，先给每一个Data属性都注册getter，setter，也就是reactive化。然后再new 一个自己的Watcher对象，此时watcher会立即调用组件的render函数去生成虚拟DOM。在调用render的时候，就会需要用到data的属性值，此时会触发getter函数，将当前的Watcher函数注册进sub里。
2. 第二步：当data属性发生改变之后，就会遍历sub里所有的watcher对象，通知它们去重新渲染组件。

## 实现原理
### 任务拆分
拆分任务可以让我们的思路更加清晰：<br />（1）将vue中的data中的内容绑定到输入文本框和文本节点中（解析{{}}指令）<br />（2）当文本框的内容改变时，vue实例中的data也同时发生改变<br />（3）当data中的内容发生改变时，输入框及文本节点的内容也发生变化<br />

### 绑定内容
 通过DocuemntFragment（碎片化文档）劫持所有的子节点，然后对每一个节点进行处理，看是不是有跟vm实例中有关联的内容，如果有，修改这个节点的内容。然后重新添加入DocumentFragment中。
```javascript
 function nodeToFragment(node,vm){
        var fragment = document.createDocumentFragment();
        var child;
        while(child = node.firstChild){//在向碎片化文档中添加节点时，每个节点都处理一下。
            compile(child,vm); //***对每一个节点进行处理
            fragment.appendChild(child);
        };
        return fragment;
 }
 /***************************使用****************************/
//在vue初始化的时候调用
function vue(){
   //...
   var id = options.el
   var dom = nodeToFragment(document.getElementById(id),this)//***
   //处理完所有的dom节点后，重新将内容添加回去
   document.getElementById(id).appendChild(dom)
}
```


### view变换 => model变化
通过事件监听器keyup，input等，来获取到最新的value，然后通过Object.defineProperty将获取的最新的value，赋值给实例vm的text。<br />修改输入框内容 => 在事件回调函数中修改属性值 => 触发属性的 set 方法
```javascript
function compile(node,vm){
       //...
        if(node.nodeType === 1){
           //...
            for(let i=0;i<attr.length;i++){
                if(attr[i].nodeName == 'v-model'){//属性名为v-model
                    //...
                    node.addEventListener('input',function(e){//***
                        vm[value] = e.target.value;//将实例的text修改为最新值,此时会触发set
                    })
                   //...
                }
            }
        }
        //如果是文本节点
        if(node.nodeType === 3){
            //...
        }
    }
```

**把vm实例中的data下的text通过Object.defineProperty设置为访问器属性，这样给vm.text赋值，就触发了set。**<br />先实现一个响应式监听属性的函数。一旦有赋新值就发生变化
```javascript
function observer(obj,vm){//实现一个观察者，对每一个实例的每个属性值都进行观察
        for(let key of Object.keys(obj)){//遍历对象的每个key，变成响应式
            defineReactive(vm,key,obj[key]);//***
        }
 }
 function defineReactive(obj,key,val){
        object.definProperty(obj,key,{
            get:function(){
                return val;
            },
            set:function(newVal){//给vm[key]赋值时就会触发 set
                if(newVal == val){
                    return;
                }
                val = newVal;
            },
        })
}
/***************************使用****************************/
//在vue初始化的时候调用
function vue(){
    this.data = options.data;
     observer(data,this) //***
}
```
### model变化 => view变化
修改vm实例的属性 该改变输入框的内容 与 文本节点的内容。在页面中多处用到 data中的属性，这是1对多的。也就是说，改变1个model的值可以改变多个view中的值。<br />这就需要我们引入一个新的知识点：
#### 订阅/发布者模式
订阅发布模式（又称观察者模式）定义了一种一对多的关系，让多个观察者同时监听某一个主题对象，这个主题对象的状态发生改变时就会通知所有观察者对象。发布者发出通知 => 主题对象收到通知并推送给订阅者 => 订阅者执行相应操作<br />
发出通知 dep.notify() => 触发订阅者的 update 方法 => 更新视图

对compile做以下修改
```javascript
function compile(node,vm){
       //...
        //如果是文本节点
        if(node.nodeType === 3){
            //...
            //node.nodeValue=vm[name]; //删除这一段
            new Watcher(vm,node,name) //不直接通过赋值，通过绑定一个订阅者
        }
    }
```

对defineReactive做以下修改
```javascript
function defineReactive(obj,key,val){
       var dep=new Dep();//***新增
        object.definProperty(obj,key,{
            get:function(){
                if(Dep.target){ //***新增 get 方法中将该 watcher 添加到了对应访问器属性的 dep 中（Watcher中会触发）
                    dep.addSub(Dep.target);
                }
                return val;
            },
            set:function(newVal){//给vm[key]赋值时就会触发 set
                if(newVal == val){
                    return;
                }
                val = newVal;
                //一旦更新马上通知
                dep.notify();//***新增  触发所有订阅者的更新update方法
            },
        })
}
   //      dep构造函数
        function Dep() {
            this.subs = []
        }
        Dep.prototype = {
            addSub(sub) {
                this.subs.push(sub)
            },
            notify() {
                this.subs.forEach(function(sub) {
                    sub.update();
                })
            }
        }
```

Watcher的实现
```javascript
function Watcher(vm,node,name){
        Dep.target =this;
        this.vm=vm;
        this.node=node;
        this.name=name;
        this.update();
        Dep.target=null;
}
Watcher.prototype={
        update(){//dep.notify()中会调用
            this.get();
            this.node.nodeValue=this.value;//更改节点内容的关键
        },
        get(){//在update中调用
            this.value=this.vm[this.name];//读取了 vm 的访问器属性，从而触发了访问器属性的 get 方法。get 方法中将该 watcher 添加到了对应访问器属性的 dep 中
        }
}
```

### vue2.x版本响应式实现方案的弊端
通过我们的分析，也就看到了vue2.x版本响应式实现的弊端：

1. Object.defineProperty()这个api无法原生的对数组进行响应式监听
1.  实现过程中对于深度嵌套的数据，递归消耗大量性能
1.  我们注意到，Object.defineProperty()这种实现，以及数组的实现，都存在一个问题，那就是没办法监听到后续的手动新增删除属性元素，比如数组，直接通过索引去设置和改变值是不会触发视图更新的，当然vue为我们提供了vue.set和vue.delete这样的api，但终究是不方便的


## 动态绑定遇到的坑
### 发生背景
在一个表格中嵌套复选框，点过全选后取消，再点击单个复选框值有改变，但是界面上复选框没有更新选中状态。

![]('./img/img3.png')

```javascript
 this.dataList = JSON.parse(JSON.stringify(this.seatList));//第一次修改 []-》this.seatList
        this.dataList.map(item => {//第二次修改 item对象增加checked字段
            item.checked = false
            return item
        })
```
原因：服务端返回的数据中没有checked字段，第一次赋值的时候是没有checked字段的对象数组，vue监听到dataList由` []=>[{},{}]`（相当于触发push），触发了[]的set方法，对新值`[{},{}]`的进行递归调用监听到{}中的每个对象key。<br />
![]('./img/img2.png')

由上图可知，虽然马上遍历每个对象添加checked属性，但是vue没有对checked设置set和get方法。
`Object.defineProperty()`这种实现，以及数组的实现，都存在一个问题，那就是没办法监听到后续的手动新增删除属性元素。

**解决**

1. 在开始初始化数据的时候，先添加checked属性再赋值到data上。
```javascript
let data = JSON.parse(JSON.stringify(this.seatList));
       data.map(item => {//将数据手动添加check属性后
       item.checked = false
       return item
})
this.dataList = data //一次性赋值给dataList，对每个属性进行绑定
```

2. 直接对check属性做监听
```javascript
 this.dataList.map(item => {
        //item.checked = false
        this.$set(item, 'checked', false) // 这里，给对象添加属性，用$set方法。
        return item
})
```

![]('./img/img1.png')

## 实现响应式的方式

## 参考链接
1. [vue与element ui的el-checkbox的坑 ](https://www.cnblogs.com/lovemomo/p/11589929.html)
1. [Vue3 中的数据侦测](https://juejin.im/post/6844903957807169549)
1. [理解VUE双向数据绑定原理和实现---赵佳乐](https://www.jianshu.com/p/e7ebb1500613)


