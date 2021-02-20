# es6
## let/const（常用）
### 块级作用域
- 与var不同的是，let/const会创建一个块级作用域（通俗讲就是一个花括号内是一个新的作用域）
- 使用let/const关键字声明变量的for循环，除了会创建块级作用域，还会将它绑定到每个循环中，确保对上个循环结束时候的值进行重新赋值。**每次循环都会声明一**次（对比var声明的for循环只会声明一次）

### 暂时性死区
由let/const声明的变量，当它们包含的词法环境(Lexical Environment)被实例化时会被创建，但只有在变量的词法绑定(LexicalBinding)已经被求值运算后，才能够被访问
 + var在创建时就被初始化，并且赋值为undefined
 + let/const在进入块级作用域后，**会因为提升的原因先创建，但不会被初始化**，直到声明语句执行的时候才被初始化，初始化的时候如**果使用let声明的变量没有赋值，则会默认赋值为undefined**，而**const必须在初始化的时候赋值**。而创建到初始化之间的代码片段就形成了暂时性死区

### const
- const声明变量的时候必须赋值，否则会报错，同样使用const声明的变量被修改了也会报错
- const声明变量不能改变，如果声明的是一个引用类型，则不能改变它的内存地址
- 没有显式的声明块级作用域，let/const声明的变量却没有变为全局变量

```js
let x=0;
console.log(window.x) //undefined
```
## 箭头函数
箭头函数对于使用function关键字创建的函数有以下区别
- 箭头函数没有arguments（建议使用更好的语法，剩余运算符替代）
- 箭头函数没有prototype属性，不能用作构造函数（不能用new关键字调用）
- 箭头函数没有自己this，它的this是词法的，引用的是上下文的this，即在你写这行代码的时候就箭头函数的this就已经和外层执行上下文的this绑定了

## iterator迭代器
对于可迭代的数据解构，ES6在内部部署了一个[Symbol.iterator]属性，它是一个函数，执行后会返回iterator对象（也叫迭代器对象），而生成iterator对象[Symbol.iterator]属性叫iterator接口,有这个接口的数据结构即被视为可迭代的。

默认部署iterator接口的数据结构有以下几个，注意普通对象默认是没有iterator接口的（可以自己创建iterator接口让普通对象也可以迭代）
- Array
- Map
- Set
- String
- TypedArray（类数组）
- 函数的 arguments 对象
- NodeList 对象


```js
let arr=[1,2,4]
let iterator=arr[Symbol.iterator]() //需要使用键名的方式访问
iterator.next() //{value:1,done:false}
iterator.next() //{value:2,done:false}
iterator.next() //{value:3,done:false}
iterator.next() //{value:undefined,done:true}
```
总结：
- 可迭代的数据结构会有一个[Symbol.iterator]方法
- [Symbol.iterator]执行后返回一个iterator对象
- iterator对象有一个next方法
- 执行一次next方法(消耗一次迭代器)会返回一个有value,done属性的对象

es5实现一个迭代器
```js
function createIterator(items) {
    var i = 0;
    return {
        next: function() {
            var done = i >= item.length;
            var value = !done ? items[i++] : undefined;

            return {
                done: done,
                value: value
            };
        }
    };
}

// iterator 就是一个迭代器对象
var iterator = createIterator([1, 2, 3]);

console.log(iterator.next()); // { done: false, value: 1 }
console.log(iterator.next()); // { done: false, value: 2 }
console.log(iterator.next()); // { done: false, value: 3 }
console.log(iterator.next()); // { done: true, value: undefined }
```
## for...of循环
-  for ... of只能用在**可迭代对象**上,获取的是迭代器**返回的value值**,for ... in 可以获取**所有对象的键名**
-  for ... in**会遍历对象的整个原型链**,性能非常差不推荐使用,而for ... of**只遍历当前对象**不会遍历它的原型链
-  对于数组的遍历,for ... in会返回数组中所有**可枚举的属性**(包括原型链上可枚举的属性),for ... of只返回数组的下标对应的属性值
-  for... of循环同时支持break,continue,return(在函数中调用的话)并且可以和对象解构赋值一起使用


```js
let arr=[{a:1,b:2,c:3}]
let obj={}
for({a:obj.a} of arr){
    obj.a //1=>2=>3
}
```

## ES6 Module
ES6 Module使用import关键字导入模块，export关键字导出模块，它还有以下特点
- ES6 Module是静态的，也就是说它是在编译阶段运行，和var以及function一样具有提升效果（这个特点使得它支持tree shaking）
- 自动采用严格模式（顶层的this返回undefined）
- ES6 Module支持使用export {<变量>}导出具名的接口，或者export default导出匿名的接口

```js
//module.js 导出
let x=10
let y=20
export {x}
export default y
```

```js
//a.js导入
import {x} from "./module.js"
import y from './module.js'
```
> export {<变量>}导出的是一个变量的引用，export default导出的是一个值。在a.js中使用import导入这2个变量的后，在module.js中因为某些原因**x变量被改变了，那么会立刻反映到a.js，而module.js中的y变量改变后，a.js中的y还是原来的值**

ES6 Module和CommonJs的一些区别
- CommonJs输出的是一个值的拷贝,ES6 Module通过export {<变量>}输出的是一个变量的引用,export default输出的是一个值
- CommonJs运行在服务器上,被设计为运行时加载,即代码执行到那一行才回去加载模块,而ES6 Module是静态的输出一个接口,发生在编译的阶段
- CommonJs在第一次加载的时候运行一次并且会生成一个缓存,之后加载返回的都是缓存中的内容

参考文章：
1. [近一万字的ES6语法知识点补充](https://juejin.im/post/5c6234f16fb9a049a81fcca5)
2. [一个合格的中级前端工程师需要掌握的 28 个 JavaScript 技巧](https://juejin.im/post/5cef46226fb9a07eaf2b7516#heading-9)


## Proxy（重点）
Proxy作为一个"拦截器",访问对象,必须先经过这层拦截器,Proxy同样是一个构造函数,使用new关键字生成一个拦截对象的实例。Proxy一般和Reflect配套使用,前者拦截对象,后者返回拦截的结果,Proxy上有的的拦截方法Reflect都有
## proxy
### 术语
- handler
包含捕捉器（trap）的占位符对象，可译为处理器对象。一个通常以函数作为属性的对象，各属性中的函数分别定义了在执行各种操作时代理 p 的行为。
- traps
提供属性访问的方法。这类似于操作系统中捕获器的概念。
- target
被 Proxy 代理虚拟化的对象。它常被作为代理的存储后端。

```js
const handler = {
    get: function(obj, prop) {
        return prop in obj ? obj[prop] : 37;
    }
};

const p = new Proxy({}, handler);
p.a = 1;
p.b = undefined;

console.log(p.a, p.b);      // 1, undefined
console.log('c' in p, p.c); // false, 37
```
注意：
代理应该在所有地方都完全替代目标对象。目标对象被代理后，任何人都不应该再引用目标对象。否则很容易搞砸。
```js
dictionary = new Proxy(dictionary, ...);
```
### set方法

```js
let numbers = [];

numbers = new Proxy(numbers, { // (*)
  set(target, prop, val) { // 拦截写入属性操作
    if (typeof val == 'number') {
      target[prop] = val;
      return true;
    } else {
      return false;
    }
  }
});

numbers.push(1); // 添加成功
numbers.push(2); // 添加成功
alert("Length is: " + numbers.length); // 2

numbers.push("test"); // TypeError（proxy 的 'set' 返回 false）
```
> - 数组的内建方法依然有效！值被使用 push 方法添加到数组。当值被添加到数组后，数组的 length 属性会自动增加。我们的代理对象 proxy 不会破坏任何东西。我们不必重写诸如 push 和 unshift 等添加元素的数组方法。
> - 对于 set 操作，它必须在成功写入时返回 true。如果我们忘记这样做，或返回任何假（falsy）值，则该操作将触发 TypeError。


参考文章：
1. [JavaScript ES6代理的实际用例](https://juejin.im/post/5efd6683e51d453475009ea6)
2. [Proxy  MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
3. [Proxy 的巧用](https://juejin.im/post/5d2e657ae51d4510b71da69d)
4. [Proxy 和 Reflect（分析较深入）](https://zh.javascript.info/proxy#tasks)


## Reflect
Reflect 是一个内置的对象，它提供拦截 JavaScript 操作的方法。这些方法与proxy handlers的方法相同。Reflect不是一个函数对象，因此它是不可构造的。Reflect与Proxy是相辅相成的，只要是Proxy对象的方法，就能在Reflect对象上找到对应的方法。

检测一个对象是否存在特定属性
```js
const duck = {
  name: 'Maurice',
  color: 'white',
  greeting: function() {
    console.log(`Quaaaack! My name is ${this.name}`);
  }
}

Reflect.has(duck, 'color');
// true
Reflect.has(duck, 'haircut');
// false
```


```js
    const obj = {name: 'song'};
    const proxy = new Proxy(obj, {
        get(target, name) {
            //Reflect保证原生行为能够正常执行
            return Reflect.get(target, name)
        },
        set(target, name) {
            return Reflect.set(target, name, value)
        },
        has(target, name) {
            //通过in操作符会调用has方法
            return Reflect.has(target, name)
        }
    });
    //reflect 将原有的命令式都转化为函数行为
    console.log("name" in proxy);
    console.log(Reflect.has(proxy, "name"));
```
不用reflect的写法
```js
 has(target, name) {
            // //通过in操作符会调用has方法
            if (name[0] === '_') {
                return false;
            }
            return name in target;
        }
```
### 区别
与Proxy相同，也是ES6新增。
它新增了一些方法，这些方法可以使一些操作更加规范化，更加便利。对象有如下特点:
1. 只要Proxy对象具有的代理方法，Reflect对象全部具有，以静态方法的形式存在。这些方法能够执行默认行为，无论Proxy怎么修改默认行为，总是可以通过Reflect对应的方法获取默认行为。
1. 新增的方法与现有一些方法功能重复，新增的方法会取代现有的方法，比如Reflect.getPrototypeOf()，Object对象具有同样的方法，功能也相同，但是将getPrototypeOf()方法移植到Reflect更加合理。还有一些新增方法用来取代现有的命令式操作，比如判断属性是否存在的in命令，用Reflect.has()方法替代。

### 使用reflect比handler更好的示例
对于每个可被 Proxy 捕获的内部方法，在 Reflect 中都有一个对应的方法，其名称和参数与 Proxy 陷阱相同。所以，我们可以使用 Reflect 来将操作转发给原始对象。

对user 对象进行代理（proxy），没有任何问题。
另一个对象 admin 从 user 继承后，我们可以观察到错误的行为
```js
let user = {
  _name: "Guest",
  get name() {
    return this._name;
  }
};

let userProxy = new Proxy(user, {
  get(target, prop, receiver) {
    return target[prop]; // (*) target = user（问题关键）
  }
});

let admin = {
  __proto__: userProxy,//继承了user的代理
  _name: "Admin"
};

// 期望输出：Admin
alert(admin.name); // 输出：Guest 
```
问题分析：
- 当我们读取 admin.name 时，由于 admin 对象自身没有对应的的属性，搜索将转到其原型。
- 原型是 userProxy
- 当调用 target[prop] 时，若 prop 是一个 getter，它将在 this=target 上下文中运行其代码。因此，结果是来自原始对象 target 的 this._name，即来自 user。

问题解决：
- 如何把上下文传递给getter？对于一个常规函数，我们可以使用 call/apply，但这是一个getter，它不能“被调用”，只能被访问。
- Reflect.get 可以做到。如果我们使用它，一切都会正常运行。


```js
let userProxy = new Proxy(user, {
  get(target, prop, receiver) { // receiver = admin
    return Reflect.get(target, prop, receiver); // (*)重点
  }
});
```
> - 现在 receiver 保留了对正确 this 的引用（即 admin），该引用是在 (*) 行中被通过 Reflect.get 传递给 getter 的。
> - 因此，return Reflect... 提供了一个安全的方式，可以轻松地转发操作，并确保我们不会忘记与此相关的任何内容。

参考链接
1. [Reflect MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect)
2. [ES6 中的Proxy 和 Reflect 到底是什么鬼？](https://www.jianshu.com/p/d36b06a8010e)

## class

## es6转换到es5


