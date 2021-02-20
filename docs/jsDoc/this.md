#  this/call/apply/bind
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
this指向全局变量。

```js
function foo(){
  return this;
}
console.log(foo() === window); // true
```

#### call、apply
this指向绑定的对象上

```js
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

```js
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
```js
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

```js
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


```js
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
2. 不能使用new来调用。 
3. 没有原型对象。 
4. 不可以改变this的绑定。 
5. 形参名称不能重复。

#### 作为对象的一个方法
this指向调用的对象

```js
var person = {
  name: "axuebin",
  getName: function(){
    return this.name;
  }
}
console.log(person.getName()); // axuebin  this指向person
```
this又指向全局变量
```js
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

#### 作为一个构造函数
this被绑定到正在构造的新对象

```js
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

```js
var ele = document.getElementById("id");
ele.addEventListener("click",function(e){
  console.log(this);
  console.log(this === e.target); // true  this指向e.target
})
```
#### HTML标签内联事件处理函数
this指向所在的DOM元素

```js
<button onclick="console.log(this);">Click Me</button>
```
总结：
判断一个函数的this绑定，就需要找到这个函数的直接调用位置
- 由new调用：绑定到新创建的对象。注意：显示return函数或对象，返回值不是新创建的对象，而是显式返回的函数或对象。
- 由call或apply、bind调用：绑定到指定的对象
- 由上下文对象调用：绑定到上下文对象
- 默认：全局对象
- 注意：箭头函数不使用上面的绑定规则，根据外层作用域来决定this，继承外层函数调用的this绑定。

## call、apply的区别

## call、apply、bind的实现
### call实现

```js
  Function.prototype.call2 = function(content = window) {     
     content.fn = this; //将函数设置为对象的属性，本例中this指向bar 。 ==》foo.fn=bar let args = [...arguments].slice(1); 
     let result = content.fn(...args); 
     delete content.fn; return result; 
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
### bind实现

参考链接：
1. [面试官问：JS的this指向](https://juejin.im/post/5c0c87b35188252e8966c78a#heading-5)
2. [从这两套题，重新认识JS的this、作用域、闭包、对象](https://segmentfault.com/a/1190000010981003)




