# 原型与继承
## 原型链
首先我们需要明确两点：
1️⃣__proto__和constructor是对象独有的。
2️⃣prototype属性是函数独有的；

限制：
- 引用不能形成闭环。如果我们试图在一个闭环中分配 __proto__，JavaScript 会抛出错误。
-  __proto__ 的值可以是对象，也可以是 null。而其他的类型都会被忽略。


### __proto__
ECMAScript 规范描述 `prototype` 是一个**隐式引用**，但之前的一些浏览器，已经私自实现了` __proto__`这个属性，使得可以通过 `obj.__proto__` 这个显式的属性访问，访问到被定义为隐式属性的 `prototype`。

`__proto__`属性既不能被 `for in` 遍历出来，也不能被 `Object.keys(obj)` 查找出来。

`__proto__`是对象所独有的，并且`__proto__`是一个对象指向他的原型对象。我们也可以理解为父类对象。当你在访问一个对象属性的时候，如果该对象内部不存在这个属性，那么就会去它的`__proto__`属性所指向的对象（父类对象）上查找，如果父类对象依旧不存在这个属性，那么就会去其父类的`__proto__`属性所指向的父类的父类上去查找。直到找到 null。而这个查找的过程，也就构成了==原型链==。

### prototype
prototype是函数所独有的。

### constructor
任何函数，只要通过new操作符来调用，那它就可以作为构造函数。
在默认情况下，所有原型对象都会自动获取一个`constructor`属性，这个属性是一个指向`prototype`属性所在函数的指针。

### instanceof

实现

```js
function instance_of(L, R) {//L 表示左表达式，R 表示右表达式
 var O = R.prototype;// 取 R 的显示原型
 L = L.__proto__;// 取 L 的隐式原型
 while (true) { 
   if (L === null) 
     return false; 
   if (O === L)// 这里重点：当 O 严格等于 L 时，返回 true 
     return true; 
   L = L.__proto__; 
 } 
}
```

### new的实现
new操作符做了以下几件事
- 它创建了一个全新的对象
- 它会执行`[[Prototype]]`（也就是__proto__）链接
- 它使this指向新建的对象
- 通过`new` 创建的每个对象最终被`[[Prototype]]`链接到这个函数的`prototype`对象上。
- 如果函数没有返回对象型Object（包括Function，Array，Date，RegExg，Error），那么`new` 表达式中的函数调用将返回该对象的引用。

```js
function New(func){
    var res={};
    if(func.prototype!==null){
        res.__proto__=func.prototype;//通过原型继承
    }
    var ret=func.apply(res,Array.prototype.slice.call(arguments,1));//使this指向新创建的对象，执行构造函数
    if((typeof ret==="object"||typeof ret==="function")&&ret!=null){
        return ret;
    }
    return res;
}
//测试
var obj=New(A,1,2); 
//等价于
var obj=new A(1,2)

```

## 继承的几种方式
### 原型链继承
```js
function Parent() {
    this.name = 'jchermy';// this.names = ["aa", "bb"];时修改一个实例，其他也会变化
}

Parent.prototype.getName =  function() {
    console.log(this.name);
}

function Child() {}
/*==================继承实现===================*/
Child.prototype = new Parent();

/*====================测试=====================*/
var child1 = new Child();
console.log(child1.getName()); //jchermy

```
由此我们可以得出原型链继承的缺点：
1. 引用类型的属性被所有实例共享
2. 在创建Child实例时，不能向Parent传参
3. 基于构造函数和原型链
4. 通过 hasOwnProperty() 方法来确定自身属性与其原型属性
5. 通过 isPrototypeOf() 方法来确定原型和实例的关系
6. 在实例中可以修改原型中引用类型的值

### 构造函数继承
```js
function Parent(name) {
    this.name = "parent "+name;
    this.sayName=fucntion(){
        
    }
}

function Child(name) {
    this.name = "child"+name;
    /*===================继承实现==================*/
    Parent.call(this, name);//借调父的构造函数
}

var child1 = new Child('hemin');
console.log(chil1.name); //"parent hemin"

var child2 = new Child("aa");
console.log(child2.name); //"parent aa"
```
缺点：方法都在构造函数中定义，每次创建实例都会创建一遍方法

### 组合式继承

```js
function Parent(name) {
    this.name = name;
    this.colors = ["red", "blue"];
}

Parent.prototype.getName = function() {
    console.log(this.name);
}

function Child(name, age) {
    /*======================继承实现=======================*/
    Parent.call(this, name); //借调父的构造函数
    this.age = age;
}
 /*======================继承实现=======================*/
Child.prototype = new Parent(); //和父关联，继承关系
Child.prototype.constructor = Child;

/*=========测试==========*/
var child1 = new Child("aa", 18);
child1.colors.push("black");//修改其中一个实例

child1.name; //"aa"
child1.age; //18
child1.colors; //["red", "blue","black"]

var child2 = new Child("bb", 20);
child2.name; //"bb"
child2.age; //20
child2.colors; //["red", "blue"]
```

然而组合继承也有一个缺点，就是会调用两次父构造函数。
优点
1. 可以复用原型上定义的方法
2. 可以保证每个函数有自己的属性，可以解决原型中引用类型值被修改的问题
缺点
1. staff 会被调用 2 次：
第 1 次是employee.prototype = new staff();，第 2 次是调用 staff.call(this)。

### 原型式继承/ Object.create()

```js
function createObj(o) {//同Object.create的实现
    function F() {}
    F.prototype = o;
    return new F();
}

var person = {
    name: 'jchermy',
    friends: ["aa", "bb"]
}
/*==============测试==============*/
var person1 = createObj(person);
var person2 = createObj(person);

// 注意：修改person1.name的值，person2.name的值并未发生改变，
// 并不是因为person1和person2有独立的 name 值，而是因为person1.name = 'person1'，给person1添加了 name 值，并非修改了原型上的 name 值。

person1.name = "xiaomi";
console.log(person2.name); //"jchermy"

person2.friends.push("cc");
console.log(person1.friends); //["aa", "bb", "cc"]
```
缺点：包含引用类型的属性值始终会共享相应的值，与原型链继承一样

### 寄生式继承

```js
 function createObj(o) {
    var clone = Object.create(o);
    clone.sayName = function () {
        console.log("hi");
      }
      return clone;
}

var person = {
    name: "jchermy",
    friends: ["aa", "bb"]
};

var person1 = createObj(person);
var person2 = createObj(person);

person1.name = "xiaomi";
console.log(person1.name); //"xiaomi"
console.log(person2.name); //"jchermy"

person1.friends.push("xxx");
console.log(person1.friends); // ["aa", "bb", "xxx"]
console.log(person2.friends); // ["aa", "bb", "xxx"]
```
缺点:
1. 跟借用构造函数模式一样，每次创建对象都会创建一遍方法
2. 包含引用类型的属性值始终会共享相应的值

### 寄生组合式继承

```js
  function Parent(name) {
    this.name = name;
    this.colors = ["red", "blue", "green"];
  }

  Parent.prototype.getName = function () {
     console.log(this.name);
  }

  function Child(name, age) {
      Parent.call(this, name);
      this.age = age;
  }

//关键的三步
  var F = function(){};
  F.prototype = Parent.prototype;
  Child.prototype = new F();
  //以上三步可以用 Child.prototype = Object.create(Parent)
  Child.prototype.constructor = Child;

  var child1 = new Child('xiaomi', 18);
  var child2 = new Child2('aa', 24);
  console.log(child1.name); //xiaomi
  console.log(child2.name); //aa

  child1.colors.push("black");
  child1.colors; //["red", "blue", "green", "black"]
  child2.colors; //["red", "blue", "green"];
```
这种方式的高效率体现它只调用了一次 `Parent `构造函数，并且因此避免了在 `Parent.prototype` 上面创建不必要的、多余的属性。与此同时，原型链还能保持不变；因此，还能够正常使用 `instanceof `和 `isPrototypeOf`。开发人员普遍认为寄生组合式继承是引用类型最理想的继承范式。

参考链接
[JavaScript深入之继承的多种方式和优缺点](https://github.com/mqyqingfeng/Blog/issues/16)


## 继承时的this值
this 根本不受原型的影响。

无论在哪里找到方法：在一个对象还是在原型中。在一个方法调用中，this 始终是点符号 . 前面的对象。

因此，setter 调用 admin.fullName= 使用 admin 作为 this，而不是 user。

## for…in 循环
for..in 循环也会迭代继承的属性。

```js
let animal = {
  eats: true
};

let rabbit = {
  jumps: true,
  __proto__: animal
};

// Object.keys 只返回自己的 key
alert(Object.keys(rabbit)); // jumps

// for..in 会遍历自己以及继承的键
for(let prop in rabbit) alert(prop); // jumps，然后是 eats
```
如果这不是我们想要的，并且我们想排除继承的属性，那么这儿有一个内建方法 obj.hasOwnProperty(key)：如果 obj 具有自己的（非继承的）名为 key 的属性，则返回 true。
### for..in会忽略不可枚举属性
如果 for..in 循环会列出继承的属性，那为什么 hasOwnProperty 没有像 eats 和 jumps 那样出现在 for..in 循环中？

答案很简单：它是不可枚举的。就像 Object.prototype 的其他属性，hasOwnProperty 有 enumerable:false 标志。**并且 for..in 只会列出可枚举的属性。**这就是为什么它和其余的 Object.prototype 属性都未被列出。

几乎所有其他键/值获取方法，**例如 `Object.keys `和` Object.values` 等，都会忽略继承的属性。**

它们只会对对象自身进行操作。**不考虑 继承自原型的属性**。

for..of用法见`es6/for...of循环`

## __proto__总结
- 在 JavaScript 中，所有的对象都有一个隐藏的 [[Prototype]] 属性，它要么是另一个对象，要么就是 null。
- 我们可以使用 obj.__proto__ 访问它（历史遗留下来的 getter/setter，这儿还有其他方法，很快我们就会讲到）。
- 通过 [[Prototype]] 引用的对象被称为“原型”。
如果我们想要读取 obj 的一个属性或者调用一个方法，并且它不存在，那么 JavaScript 就会尝试在原型中查找它。
- 写/删除操作直接在对象上进行，它们不使用原型（假设它是数据属性，不是 setter）。
- 如果我们调用 obj.method()，而且 method 是从原型中获取的，this 仍然会引用 obj。因此，方法始终与当前对象一起使用，即使方法是继承的。
- for..in 循环在其自身和继承的属性上进行迭代。所有其他的键/值获取方法仅对对象本身起作用。

参考链接
[原型继承](https://zh.javascript.info/prototype-inheritance)

## F.prototype
可以使用诸如` new F()` 这样的构造函数来创建一个新对象。

如果 `F.prototype `是一个对象，那么 new 操作符会使用它为新对象设置 `[[Prototype]]`。

```js
let animal = {
  eats: true
};

function Rabbit(name) {
  this.name = name;
}

Rabbit.prototype = animal;

let rabbit = new Rabbit("White Rabbit"); // 等价 rabbit.__proto__ == animal

alert( rabbit.eats ); // true
```
`F.prototype `属性仅在 `new F` 被调用时使用，它为新对象的 `[[Prototype]] `赋值。如果在创建之后，F.prototype 属性有了变化`（F.prototype = <another object>）`，那么通过 new F 创建的新对象也将随之拥有新的对象作为 `[[Prototype]]`，== 但已经存在的对象将保持旧有的值。==
### 默认的 F.prototype，构造器属性
每个函数都有` "prototype"` 属性，即使我们没有提供它。

默认的`"prototype" `是一个只有属性 `constructor `的对象，属性 `constructor `指向函数自身。
## F.prototype总结
- `F.prototype `属性（不要把它与 [[Prototype]] 弄混了）在 `new F` 被调用时为新对象的 [[Prototype]] 赋值。
- `F.prototype` 的值要么是一个对象，要么就是 null：其他值都不起作用。
- `"prototype"` 属性仅在设置了一个构造函数（constructor function），**并通过 new 调用时，才具有这种特殊的影响**。

参考链接
[F.prototype](https://zh.javascript.info/function-prototype)

## es6的继承用es5怎么写
es6类

```js
class User {
  constructor(name) { this.name = name; }
  sayHi() { alert(this.name); }
}
```
es5的写法

```js
// 用纯函数重写 class User

// 1. 创建构造器函数
function User(name) {
  this.name = name;
}
// 函数的原型（prototype）默认具有 "constructor" 属性，
// 所以，我们不需要创建它

// 2. 将方法添加到原型
User.prototype.sayHi = function() {
  alert(this.name);
};

```

扩展

```js
class a{
  // constructor(){
  //   this.sayHi=this.sayHi.bind(this)
  // }
  sayHi(){//绑在原型上，所以相等
    console.log(this)
  }

}
class b{
  constructor(){
  }

  sayHi=()=>{//绑在实例上，所以不相等
    console.log(this);
  }

}

var a1=new a();
var a2=new a();

var b1=new b();
var b2=new b();

console.log(a1.sayHi===a2.sayHi);
console.log(b1.sayHi===b2.sayHi);
console.log(a1.sayHi());
console.log(a2.sayHi());
console.log(b1.sayHi());
console.log(b2.sayHi());

```

参考链接
[Class 基本语法](https://zh.javascript.info/class)



