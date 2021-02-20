# 执行上下文/作用域链/闭包
## 执行上下文
执行上下文有3种类型
- 全局执行上下文：只有一个，浏览器中的全局对象就是 window 对象，this 指向这个全局对象。
- 函数执行上下文：存在无数个，只有在函数被调用的时候才会被创建，每次调用函数都会创建一个新的执行上下文。
- Eval 函数执行上下文： 指的是运行在 eval 函数中的代码，很少用而且不建议使用。

### 执行栈
执行栈，也叫调用栈，具有 LIFO（后进先出）结构，用于存储在代码执行期间创建的所有执行上下文。

首次运行JS代码时，会创建一个全局执行上下文并Push到当前的执行栈中。每当发生函数调用，引擎都会为该函数创建一个新的函数执行上下文并Push到当前执行栈的栈顶。

根据执行栈LIFO规则，当栈顶函数运行完成后，其对应的函数执行上下文将会从执行栈中Pop出，上下文控制权将移到当前执行栈的下一个执行上下文

---

JS是单线程的语言，执行顺序肯定是顺序执行，但是JS 引擎并不是一行一行地分析和执行程序，而是一段一段地分析执行，会先进行编译阶段然后才是执行阶段。
### 变量提升

```js
foo;  // undefined
var foo = function () {
    console.log('foo1');
}

foo();  // foo1，foo赋值

var foo = function () {
    console.log('foo2');
}

foo(); // foo2，foo重新赋值被覆盖
```

### 函数提升

```js
foo();  // foo2
function foo() {
    console.log('foo1');
}

foo();  // foo2

function foo() {
    console.log('foo2');
}

foo(); // foo2
```
### 声明优先级，函数 > 变量

```js
foo();  // foo2
var foo = function() {//只提升变量到头部
    console.log('foo1');
}

foo();  // foo1，foo重新赋值（覆盖了底下的foo声明）

function foo() {//整个函数声明提升
    console.log('foo2');
}

foo(); // foo1
```
- 先扫描函数声明后扫描变量
- 处理函数声明有冲突会覆盖
- 处理变量声明有冲突会忽略

### 执行上下文栈

```js
var scope = "global scope";
function checkscope(){
    var scope = "local scope";
    function f(){
        return scope;
    }
    return f();
}
checkscope();
```
执行栈的变化

```js
ECStack.push(<checkscope> functionContext);
ECStack.push(<f> functionContext);
ECStack.pop();
ECStack.pop();
```
对比另外一段代码
```js
var scope = "global scope";
function checkscope(){
    var scope = "local scope";
    function f(){
        return scope;
    }
    return f;
}
checkscope()();
```
执行栈的变化
```js
ECStack.push(<checkscope> functionContext);
ECStack.pop();
ECStack.push(<f> functionContext);
ECStack.pop();
```
参考链接：
- [JavaScript深入之执行上下文栈](https://github.com/mqyqingfeng/Blog/issues/4)
- [一道js面试题引发的思考](https://github.com/kuitos/kuitos.github.io/issues/18)

## 作用域链
每一个作用域都有对其父作用域的引用。当我们使用一个变量的时候，Javascript引擎 会通过变量名在当前作用域查找，若没有查找到，会一直沿着作用域链一直向上查找，直到 global 全局作用域。

### 嵌套作用域
```js
(function autorun(){
    let x = 1;
    function log(){ 
       console.log(x); 
    }
    log();
})();
```
log() 即是一个嵌套在 autorun() 函数里面的函数。在 log() 函数里面可以通过外部函数访问到变量 x。此时，log() 函数就是一个闭包。

闭包就是内部函数，我们可以通过在一个函数内部或者 {} 块里面定义一个函数来创建闭包。

### 外部函数作用域
内部函数可以访问外部函数中定义的变量，即使外部函数已经执行完毕。如下：

```js
(function autorun(){
    let x = 1;
    setTimeout(function log(){
      console.log(x);
    }, 10000);
})();
```
并且，内部函数还可以访问外部函数中定义的形参，如下：

```js
(function autorun(p){
    let x = 1;
    setTimeout(function log(){
      console.log(x);//1
      console.log(p);//10
    }, 10000);
})(10);

```
### 外部块作用域
内部函数可以访问外部块中定义的变量，即使外部块已执行完毕，如下：

```js
{
    let x = 1;
    setTimeout(function log(){
      console.log(x);
    }, 10000);
}
```
### 词法作用域
词法作用域是指内部函数在定义的时候就决定了其外部作用域。

```js
(function autorun(){
    let x = 1;
    function log(){
      console.log(x);
    };
    
    function run(fn){
      let x = 100;
      fn();
    }
    
    run(log);//1
})();
```
`log()` 函数是一个闭包，它在这里访问的是 `autorun()` 函数中的` x `变量，而不是` run` 函数中的变量。

> 闭包的外部作用域是在其定义的时候已决定，而不是执行的时候。

`autorun() `的函数作用域即是` log()` 函数的词法作用域。

### 静态作用域与动态作用域
因为 JavaScript 采用的是词法作用域，函数的作用域在函数定义的时候就决定了。而与词法作用域相对的是动态作用域，函数的作用域是在函数调用的时候才决定的。

```js
var value = 1;

function foo() {
    console.log(value);
}

function bar() {
    var value = 2;
    foo();
}

bar();

// 结果是 ???
```
JavaScript采用静态作用域，让我们分析下执行过程：

执行 foo 函数，先从 foo 函数内部查找是否有局部变量 value，如果没有，就根据书写的位置，查找上面一层的代码，也就是 value 等于 1，所以结果会打印 1。（有疑问）

参考文章
- [JavaScript深入之作用域链](https://github.com/mqyqingfeng/Blog/issues/6)

## 闭包
如果我们约定，用箭头表示其前后的两次输出之间有 1 秒的时间间隔，而逗号表示其前后的两次输出之间的时间间隔可以忽略，代码实际运行的结果该如何描述？
代码的输出变成：`5 -> 0,1,2,3,4`
```js
for (var i = 0; i < 5; i++) {
    (function(j) {  // j = i
        setTimeout(function() {
            console.log(new Date, j); //延迟1秒后执行所有回调
        }, 1000);
    })(i);
}

console.log(new Date, i); //立即执行输出5
```
其他解法：利用settimeout的第三个参数

```js
for (var i = 0; i < 5; i++) {
    setTimeout(function(j) {
        console.log(new Date, j);
    }, 1000, i);//利用第三个参数传递参数
}

console.log(new Date, i);
```

接着上文继续追问：如果期望代码的输出变成` 0 -> 1 -> 2 -> 3 -> 4 -> 5`，并且要求原有的代码块中的循环和两处 console.log 不变，该怎么改造代码？新的需求可以精确的描述为：代码执行时，立即输出 0，之后每隔 1 秒依次输出` 1,2,3,4`，循环结束后在大概第 5 秒的时候输出 5

```js
for (var i = 0; i < 5; i++) {
    (function(j) {
        setTimeout(function() {
            console.log(new Date, j);
        }, 1000 * j);  // 这里修改 0~4 的定时器时间
    })(i);
}

setTimeout(function() { // 这里增加定时器，超时设置为 5 秒
    console.log(new Date, i);
}, 1000 * i);

```
如果把这次的需求抽象为：在系列异步操作完成（每次循环都产生了 1 个异步操作）之后，再做其他的事情，代码该怎么组织？
```js
const tasks = []; // 这里存放异步操作的 Promise
const output = (i) => new Promise((resolve) => {
    setTimeout(() => {
        console.log(new Date, i);
        resolve();
    }, 1000 * i);
});

// 生成全部的异步操作
for (var i = 0; i < 5; i++) {
    tasks.push(output(i));
}

// 异步操作完成之后，输出最后的 i
Promise.all(tasks).then(() => {
    setTimeout(() => {
        console.log(new Date, i);
    }, 1000);
});

```
何使用 ES7 中的 async/await 特性来让这段代码变的更简洁

```js
// 模拟其他语言中的 sleep，实际上可以是任何异步操作
const sleep = (timeountMS) => new Promise((resolve) => {
    setTimeout(resolve, timeountMS);
});

(async () => {  // 声明即执行的 async 函数表达式
    for (var i = 0; i < 5; i++) {
        if (i > 0) {
            await sleep(1000); //await后面能跟什么？思考
        }
        console.log(new Date, i);
    }

    await sleep(1000);
    console.log(new Date, i);
})();
```


参考文章
- [发现 JavaScript 中闭包的强大威力](https://juejin.im/post/5c4e6a90e51d4552266576d2)
- [破解前端面试（80% 应聘者不及格系列）：从闭包说起](https://juejin.im/post/58f1fa6a44d904006cf25d22#heading-0)




