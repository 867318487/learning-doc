# this/call/apply/bind
## this
- this的指向，是在函数被调用的时候确定的。也就是执行上下文被创建时确定的。
- 在函数的执行过程中，this一旦被确定，就不可更改了。

### 全局上下文
在全局执行上下文中this都指代全局对象。

- this等价于window对象
- var === this. === winodw.

### 函数上下文
在函数内部，this的值取决于函数被调用的方式。

#### 直接调用
this指向全局变量（非严格模式下）
在严格模式下，如果进入执行环境时没有设置 this 的值，this 会保持为 undefined
```javascript
function foo(){
  return this;
}
console.log(foo() === window); // true
```

#### call、apply
this指向绑定的对象上

```javascript
var person = {
  name: "axuebin",
  age: 25
};
function say(job){
  console.log(this.name+":"+this.age+" "+job);
}
say.call(person,"FE"); // axuebin:25   this指向person
say.apply(person,["FE"]); // axuebin:25   this指向person
```

注意：
需要注意的是，指定的this值并不一定是该函数执行时真正的this值，如果这个函数处于非严格模式下，则指定为null和undefined的this值会自动指向全局对象(浏览器中就是window对象)，同时值为原始值(数字，字符串，布尔值)的this会指向该原始值的自动包装对象。

```javascript
//非严格模式，this为原始值（数字），this指向包装对象
var doSth = function(name){
    console.log(this);
    console.log(name);
}
doSth.call(2, '若川'); // Number{2}, '若川'
//严格模式，this为原始值，不变
var doSth2 = function(name){
    'use strict';
    console.log(this);
    console.log(name);
}
doSth2.call(2, '若川'); // 2, '若川'
```
#### bind
this将永久地被绑定到了bind的第一个参数。bind和call和apply类似，第一个参数也是修改this指向，只不过返回值是新函数，新函数也能当做构造函数（new）调用。

```javascript
var person = {
  name: "axuebin",
  age: 25
};
function say(){
  console.log(this.name+":"+this.age);
}
var f = say.bind(person);//this被永久的bind在person上
console.log(f());
```

#### 箭头函数
所有的箭头函数都没有自己的this，都指向外层。
箭头函数会捕获其所在上下文的this值，作为自己的this值。

```javascript
var name = 'window';
var student = {
    name: '若川',
    doSth: function(){
        // var self = this;
        var arrowDoSth = () => {
            // console.log(self.name);
            console.log(this.name);
        }
        arrowDoSth();
    },
    arrowDoSth2: () => {
        console.log(this.name);
    }
}
student.doSth(); // '若川'
student.arrowDoSth2(); // 'window'
```

箭头函数外的this是缓存的该箭头函数上层的普通函数的this。如果没有普通函数，则是全局对象（浏览器中则是window）。
**也就是说无法通过call、apply、bind绑定箭头函数的this(它自身没有this)。而call、apply、bind可以绑定缓存箭头函数上层的普通函数的this。**
比如：


```javascript
var student = {
    name: '若川',
    doSth: function(){
        console.log(this.name);
        return () => {
            console.log('arrowFn:', this.name);
        }
    }
}
var person = {
    name: 'person',
}
student.doSth().call(person); // '若川'  'arrowFn:' '若川'  
student.doSth.call(person)(); // 'person' 'arrowFn:' 'person'
```

补充：
箭头函数和普通函数的区别
1. 没有自己的this、super、arguments和new.target绑定。
1. 不能使用new来调用。
1. 没有原型对象。
1. 不可以改变this的绑定。
1. 形参名称不能重复。

#### 作为对象的一个方法
this指向调用的对象
```javascript
var person = {
  name: "axuebin",
  getName: function(){
    return this.name;
  }
}
console.log(person.getName()); // axuebin  this指向person
```
this又指向全局变量

```javascript
var name = "xb";
var person = {
  name: "axuebin",
  getName: function(){
    return this.name;
  }
}
var getName = person.getName;
console.log(getName()); // xb   this指向全局
```
注意：
this的指向要看调用的时候。第二个例子中，是在全局下调用的getName，故this指向全局。

#### setTimeout中调用
由`setTimeout()`调用的代码运行在与所在函数完全分离的执行环境上。这会导致，这些代码中包含的 `this` 关键字在非严格模式会指向 `window` (或全局)对象，严格模式下为 undefined，这和所期望的`this`的值是不一样的。
即使是在严格模式下，`setTimeout()`的回调函数里面的`this`仍然默认指向`window`对象， 并不是`undefined`。
```javascript
var person={
  name:'lucy',
  getName:function(){
    console.log(this);
    console.log("this.name",this.name)
  }
}

setTimeout(person.getName,100)//直接放在回调函数中执行
//windows
//this.name ""
person.getName()
//"{name:'lucy'}"
//this.name "lucy"
setTimeout(()=>{person.getName()},100)//用函数包一层后放入回调函数
//"{name:'lucy'}"
//this.name "lucy"
setTimeout(function(){person.getName()},1000)
//"{name:'lucy'}"
//this.name "lucy"
```

#### 作为一个构造函数
this被绑定到正在构造的新对象
```javascript
function Person(name){
  this.name = name;
  this.age = 25;
  this.say = function(){
    console.log(this.name + ":" + this.age);
  }
}
var person = new Person("axuebin");
console.log(person.name); // axuebin
person.say(); // axuebin:25
```

#### 作为一个DOM事件处理函数
this指向出发事件的元素，也就是事件处理程序所绑定到的DOM节点
```javascript
var ele = document.getElementById("id");
ele.addEventListener("click",function(e){
  console.log(this);
  console.log(this === e.target); // true  this指向e.target
})
```

#### HTML标签内联事件处理函数
this指向所在的DOM元素
```javascript
<button onclick="console.log(this);">Click Me</button>
```


总结：
判断一个函数的this绑定，就需要找到这个函数的直接调用位置
- 由new调用：绑定到新创建的对象。注意：显示return函数或对象，返回值不是新创建的对象，而是显式返回的函数或对象。
- 由call或apply、bind调用：绑定到指定的对象
- 由上下文对象调用：绑定到上下文对象
- 默认：全局对象
- 注意：箭头函数不使用上面的绑定规则，根据外层作用域来决定this，继承外层函数调用的this绑定。



### 类上下文
## 
## call、apply的区别
call 和 apply 的主要作用，是改变对象的执行上下文，并且是立即执行的。它们在参数上的写法略有区别。
```javascript
Function.call(obj,[param1[,param2[,…[,paramN]]]])

//第二个参数，必须是数组或者类数组，它们会被转换成类数组，传入 Function 中，并且会被映射到 Function 对应的参数上。
Function.apply(obj[,argArray])
```
## call、apply、bind的实现
### call实现

```javascript
  Function.prototype.call2 = function(content = window) {     
     content.fn = this; //将函数设置为对象的属性，本例中this指向bar 。 ==》foo.fn=bar let args = [...arguments].slice(1); 
     let result = content.fn(...args); 
     delete content.fn; 
     return result; 
  } 
  
  let foo = { value: 1 } 
  function bar(name, age) { 
      console.log(name) 
      console.log(age) 
      console.log(this.value); 
  } 
  bar.call2(foo, 'black', '18') // black 18 1
```


### apply实现
同call
### bind实现
bind() 方法会创建一个新函数。当这个新函数被调用时，bind() 的第一个参数将作为它运行时的 this，之后的一序列参数将会在传递的实参前传入作为它的参数。(来自于 MDN )

1. 返回一个函数
1. 可以传入参数
```javascript
Function.prototype.bind2 = function (context) {
    if (typeof this !== "function") {//调用 bind 的不是函数要报错
      throw new Error("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var self = this;
    var args = Array.prototype.slice.call(arguments, 1);

    var fNOP = function () {};
    var fBound = function () {
        var bindArgs = Array.prototype.slice.call(arguments);
      // 当作为构造函数时，this 指向实例，此时结果为 true，将绑定函数的 this 指向该实例，可以让实例获得来自绑定函数的值
        // 以上面的是 demo 为例，如果改成 `this instanceof fBound ? null : context`，实例只是一个空对象，将 null 改成 this ，实例会具有 habit 属性
        // 当作为普通函数时，this 指向 window，此时结果为 false，将绑定函数的 this 指向 context
        return self.apply(this instanceof fNOP ? this : context, args.concat(bindArgs));
    }
    //通过一个空函数来进行中转，实现构造函数优化
    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();
    return fBound;
}
```
## 类数组
**具备与数组特征类似的对象**。比如，下面的这个对象，就是一个类数组。
```javascript
let arrayLike = {
    0: 1,
    1: 2,
    2: 3,
    length: 3
};
```
类数组 arrayLike 可以通过角标进行调用，具有length属性，同时也可以通过 for 循环进行遍历。但是需要注意的是：**类数组无法使用 forEach、splice、push 等数组原型链上的方法**，毕竟它不是真正的数组。

常见的类数组：

- 获取 DOM 节点的方法，
- 方法中使用 arguments 获取到的所有参数

## call 和 apply 的用途
#### call 的使用场景
**1、对象的继承**
```javascript
function superClass () {
    this.a = 1;
    this.print = function () {
        console.log(this.a);
    }
}

function subClass () {
    superClass.call(this);//借调父类的方法实现继承属性
    this.print();
}

```
**2、借用方法（正常用法）**
**
#### apply 的一些妙用
**1、Math.max 获取数组中的最大项**
```javascript
let arr1 = [1, 2, 3];
let arr2 = [4, 5, 6];

Array.prototype.push.apply(arr1, arr2);
console.log(arr1); // [1, 2, 3, 4, 5, 6]
```
**2、实现两个数组合并**
```javascript
let arr1 = [1, 2, 3];
let arr2 = [4, 5, 6];
Array.prototype.push.apply(arr1, arr2);
console.log(arr1); // [1, 2, 3, 4, 5, 6]
```

## 参考链接：

1. [面试官问：JS的this指向](https://juejin.im/post/5c0c87b35188252e8966c78a#heading-5)
1. [从这两套题，重新认识JS的this、作用域、闭包、对象](https://segmentfault.com/a/1190000010981003)
1. [JavaScript深入之bind的模拟实现](https://github.com/mqyqingfeng/Blog/issues/12)
1. [window.setTimeout](https://developer.mozilla.org/zh-CN/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout)