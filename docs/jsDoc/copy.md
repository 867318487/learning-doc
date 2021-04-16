# 防抖节流/深浅拷贝
## 防抖实现
- 原理：在事件被触发n秒后再执行回调，如果在这n秒内又被触发，则重新计时。
- 适用场景：
   - 按钮提交场景：防止多次提交按钮，只执行最后提交的一次
   - 搜索框联想场景：防止联想发送请求，只发送最后一次输入
   - 限制鼠标连续点击
```js
function debounce(func, wait, immediate) {
    var timeout, result;
    var debounced = function () {
        var context = this;
        var args = arguments;
        if (timeout) clearTimeout(timeout);
        if (immediate) {//是否立即执行
            // 如果已经执行过，不再执行
            var callNow = !timeout;
            timeout = setTimeout(function(){
                timeout = null;
            }, wait)
            if (callNow) result = func.apply(context, args)//第一次立即执行
        }
        else {
            timeout = setTimeout(function(){
                func.apply(context, args)
            }, wait);
        }
        return result;
    };
    debounced.cancel = function() {//取消节流
        clearTimeout(timeout);
        timeout = null;
    };

    return debounced;
}
//*******************使用*****************
var count = 1;
var container = document.getElementById('container');
function getUserAction(e) {
    container.innerHTML = count++;
};
var setUseAction = debounce(getUserAction, 10000, true);
container.onmousemove = setUseAction;
document.getElementById("button").addEventListener('click', function(){
    setUseAction.cancel();
})
```
## 节流实现
- 原理：在事件被触发n秒后再执行回调，如果在这n秒内又被触发，则重新计时。
- 适用场景：
   - 按钮提交场景：防止多次提交按钮，只执行最后提交的一次
   - 搜索框联想场景：防止联想发送请求，只发送最后一次输入
   - 限制鼠标连续点击
```js
function throttle(fn,delay=2000){
    var last,timer;
    return function(){
        var now=+new Date();
        if(last&&(now<last+delay)){
            clearTimeout(timer)
            timer=setTimeout(()=>{
                console.log("最后一次打印================");
                last=now;
                fn.apply(this,arguments)
            },delay)
        }else{
            console.log(`每隔秒${delay}打印`);
            last=now;
            fn.apply(this,arguments)
        }
    }
}
```


## 浅拷贝
首先可以通过 Object.assign 来解决这个问题。

```js
let a = {
    age: 1
}
let b = Object.assign({}, a)
a.age = 2
console.log(b.age) // 1
```
当然我们也可以通过展开运算符（…）来解决
```js
let a = {
    age: 1
}
let b = {...a}
a.age = 2
console.log(b.age) // 1
```

通常浅拷贝就能解决大部分问题了，但是当我们遇到如下情况就需要使用到深拷贝了

```js
let a = {
    age: 1,
    jobs: {
        first: 'FE'
    }
}
let b = {...a}
a.jobs.first = 'native'
console.log(b.jobs.first) // native
```
浅拷贝只解决了第一层的问题，如果接下去的值中还有对象的话，那么就又回到刚开始的话题了，两者享有相同的引用。要解决这个问题，我们需要引入深拷贝。

## 深拷贝
这个问题通常可以通过 `JSON.parse(JSON.stringify(object)) `来解决。
```js
let a = {
    age: 1,
    jobs: {
        first: 'FE'
    }
}
let b = JSON.parse(JSON.stringify(a))
a.jobs.first = 'native'
console.log(b.jobs.first) // FE
```
但是该方法也是有局限性的：
- 会忽略 `undefined`
- 会忽略 `symbol`
- 不能序列化函数
- 不能解决循环引用的对象

但是在通常情况下，复杂数据都是可以序列化的，所以这个函数可以解决大部分问题，并且该函数是内置函数中处理深拷贝性能最快的。当然如果你的数据中含有以上三种情况下，可以使用` lodash `的深拷贝函数。

如果你所需拷贝的对象含有内置类型并且不包含函数，可以使用 `MessageChannel`


```js
function structuralClone(obj) {
  return new Promise(resolve => {
    const {port1, port2} = new MessageChannel();
    port2.onmessage = ev => resolve(ev.data);
    port1.postMessage(obj);
  });
}

var obj = {a: 1, b: {
    c: b
}}
// 注意该方法是异步的
// 可以处理 undefined 和循环引用对象
(async () => {
  const clone = await structuralClone(obj)
})()
```



