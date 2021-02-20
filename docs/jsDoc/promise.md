# promise

## promise的基本知识
### 三种状态
- Pending：进行中，刚创建一个Promise实例时，表示初始状态；
- resolved(fulfilled)：resolve方法调用的时候，表示操作成功，已经完成；
- Rejected：reject方法调用的时候，表示操作失败；

这三种状态只能从**pendeng-->resolved(fulfilled)，或者pending-->rejected**，不能逆向转换，也不能在resolved(fulfilled)和rejected之间转换。**并且一旦状态改变，就不会再改变**，会一直保持这个结果。

```js
//创建promise的实例
let promise = new Promise((resolve,reject)=>{
    //刚创建实例时的状态：pending

    if('异步操作成功'){
        //调用resolve方法，状态从pending变为fulfilled
        resolve();
    }else{
        //调用reject方法，状态从pending变为rejected
        reject();
    }
});
```

### then（）

```js
//then() 用于绑定处理操作后的处理程序
promise.then((res)=> {
    //处理操作成功后的业务（即Promise对象的状态变为fullfilled时调用）
},(error)=> {
    //处理操作失败后的业务（即Promise对象的状态变为rejected时调用）
});
```
### catch（）

```js
//catch() 用于操作异常
promise.catch((error)=> {
    //处理操作失败后的业务
});
```
一般来说，建议不要在then()里面定义rejected状态的回调函数，而是将then()用于处理操作成功，将catch()用于处理操作异常。因为这样做可以捕获then()执行中的错误，也更接近同步中try/catch的写法：

```js
//try-catch
// 不好的写法
promise.then((res)=> {
    //处理操作成功后的业务
  }, (error)=> {
    //处理操作失败后的业务
  });

// 好的写法
promise.then((res)=> { 
    //处理操作成功后的业务
  }).catch((error)=> {
    //处理操作失败后的业务
  });
```
>效果和写在then的第二个参数里面一样。不过它还有另外一个作用：在执行resolve的回调（也就是上面then中的第一个参数）时，如果抛出异常了（代码出错了），那么并不会报错卡死js，而是会进到这个catch方法中。

### all（）并行异步
接受一个数组作为参数，数组的元素是Promise实例对象。只有当参数中的实例对象的状态都为fulfilled时，Promise.all( )才会有返回。


```js
//创建实例promise1
            let promise1 = new Promise((resolve) => {
                setTimeout(() => {
                    resolve('promise1操作成功');
                    console.log('1')
                }, 3000);
            });

            //创建实例promise1
            let promise2 = new Promise((resolve) => {
                setTimeout(() => {
                    resolve('promise2操作成功');
                    console.log('2')
                }, 1000);
            });


            Promise.all([promise1, promise2]).then((result) => {
                console.log(result);
            });
            
            //输出的结果
            //第一秒            2
            //第三秒            1
            //第三秒后所有的结果都返回了 ["promise2操作成功","promise1操作成功"]
```
> 使用场景：执行某个操作需要依赖多个接口请求回的数据，且**这些接口之间不存在互相依赖的关系**。这时使用Promise.all()，等到所有接口都请求成功了，它才会进行操作。**谁跑的慢，以谁为准执行回调。all接收一个数组参数，里面的值最终都算返回Promise对象**

### race() 并行异步
和all()的参数一样，参数中的promise实例，**只要有一个状态发生变化（不管是成功fulfilled还是异常rejected）**，它就会有返回，其他实例中再发生变化，它也不管了。

```js
            //创建实例promise1
            let promise1 = new Promise((resolve) => {
                setTimeout(() => {
                    resolve('promise1操作成功');
                    console.log('1')
                }, 3000);
            });

            //创建实例promise1
            let promise2 = new Promise((resolve, reject) => {
                setTimeout(() => {
                    reject('promise2操作失败');// resolve('promise2操作成功');
                    console.log('2')
                }, 1000);
            });


            Promise.race([promise1, promise2])
                .then((result) => {
                    console.log("result=="+result);
                })
                .catch((error) => {
                    console.log("error=="+error);
                })
                
       //输出结果
       //第一秒                      2
       //第一秒后                    error==promise2操作失败(result==promise2操作成功)
       //第三秒                      1
```
> 1s后，promise2进入rejected状态，由于一个实例的状态发生了变化，所以Promise.race()就立刻执行了。**谁跑的快，以谁为准执行回调**


### 串行异步执行
如现在有三个请求，请求A、请求B、请求C。请求C要将请求B的请求回来的数据做为参数，请求B要将请求A的请求回来的数据做为参数。

```js
let promise = new Promise((resolve, reject) => {
                if (true) {
                    //调用操作成功方法
                    resolve('操作成功');
                } else {
                    //调用操作异常方法
                    reject('操作异常');
                }
            });

            function requestA() {
                console.log('请求A成功');
                return '下一个是请求B';//return 后可以在下一个promise中接收到
            }
            function requestB(res) {
                console.log('上一步的结果：' + res);//接受到上一个promsie返回的
                console.log('请求B成功');
                return '下一个是请求C';
            }
            function requestC(res) {
                console.log('上一步的结果：' + res);
                console.log('请求C成功');
            }
            function requestError() {
                console.log('请求失败');
            }
            //then处理操作成功，catch处理操作异常
            promise.then(requestA)
                .then(requestB)
                .then(requestC)
                .catch(requestError);
                
    //============输出结果==========
    //请求A成功
    //上一步的结果：下一个是请求B
    //请求B成功
    //上一步的结果：下一个式请求C
    //请求C成功
    //...
```
写法优化
```js
// 串行异步执行
let tasks=[promise,requestA,requestB,requestC];
            let parallelPromises =()=>{
               tasks.reduce(
                   (total, currentValue) => total.then(
                      currentValue
                    ),Promise.resolve()
               )}
```

>可以看出请求C依赖请求B的结果，请求B依赖请求A的结果，在请求A中是使用了return将需要的数据返回，传递给下一个then()中的请求B，实现了参数的传递。同理，请求B中也是用了return，将参数传递给了请求C。

## 实现一个promise
支持三种状态
- 实现promise的三种状态。
- 实现promise对象的状态改变，改变只有两种可能：从pending变为fulfilled和从pending变为rejected。
- 实现一旦promise状态改变，再对promise对象添加回调函数，也会立即得到这个结果

```js
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";
```
构造函数
```js
function MyPromise(fn) {
    const self = this;
    self.value = null;
    self.error = null;
    self.status = PENDING;
    self.onFulfilledCallbacks = [];//支持链式调用
    self.onRejectedCallbacks = [];

    function resolve(value) {
        if (value instanceof MyPromise) {
            return value.then(resolve, reject);
        }
        if (self.status === PENDING) {
            setTimeout(() => {//使promise支持同步方法
                self.status = FULFILLED;
                self.value = value;
                //支持链式调用
                self.onFulfilledCallbacks.forEach((callback) => callback(self.value));
            }, 0)
        }
    }

    function reject(error) {
        if (self.status === PENDING) {
            setTimeout(function() {
                self.status = REJECTED;
                self.error = error;
                //支持链式调用
                self.onRejectedCallbacks.forEach((callback) => callback(self.error));
            }, 0)
        }
    }
    try {
        fn(resolve, reject);
    } catch (e) {
        reject(e);
    }
}
```
> 在reslove和reject里面用setTimeout进行包裹，使其到then方法执行之后再去执行，这样我们就让promise支持传入同步方法，另外，关于这一点，Promise/A+规范里也明确要求了这一点。

支持链式调用
- 首先存储回调时要改为使用数组
- 改成遍历回调数组执行回调函数
- 在最后一行加一个return this即可，这其实和jQuery链式操作的原理一致，每次调用完方法都返回自身实例，后面的方法也是实例的方法，所以可以继续执行

支持串行异步任务
- 实现异步操作串行，我们不能将回调函数都注册在初始promise的onFulfilledCallbacks里面，而要将每个回调函数注册在对应的异步操作promise的onFulfilledCallbacks里面。
- 保持这种链式写法的同时又能使异步操作衔接执行。我们其实让then方法最后不再返回自身实例，而是返回一个新的promise即可，我们可以叫它bridgePromise，它最大的作用就是衔接后续操作


```js
MyPromise.prototype.then = function(onFulfilled, onRejected) {
    const self = this;
    let bridgePromise;//return bridgePromise支持链式调用
    onFulfilled = typeof onFulfilled === "function" ? onFulfilled : value => value;
    onRejected = typeof onRejected === "function" ? onRejected : error => { throw error };
    if (self.status === FULFILLED) {
        return bridgePromise = new MyPromise((resolve, reject) => {
            setTimeout(() => {
                try {
                    let x = onFulfilled(self.value);
                    resolvePromise(bridgePromise, x, resolve, reject);
                } catch (e) {
                    reject(e);
                }
            }, 0);
        })
    }
    if (self.status === REJECTED) {
        return bridgePromise = new MyPromise((resolve, reject) => {
            setTimeout(() => {
                try {
                    let x = onRejected(self.error);
                    resolvePromise(bridgePromise, x, resolve, reject);
                } catch (e) {
                    reject(e);
                }
            }, 0);
        });
    }
    if (self.status === PENDING) {
        return bridgePromise = new MyPromise((resolve, reject) => {
            self.onFulfilledCallbacks.push((value) => {
                try {
                    let x = onFulfilled(value);
                    resolvePromise(bridgePromise, x, resolve, reject);
                } catch (e) {
                    reject(e);
                }
            });
            self.onRejectedCallbacks.push((error) => {
                try {
                    let x = onRejected(error);
                    resolvePromise(bridgePromise, x, resolve, reject);
                } catch (e) {
                    reject(e);
                }
            });
        });
    }
}
```
resolvePromise里加了额外的两个判断
- 第一个是x和bridgePromise是指向相同值时，报出循环引用的错误，使promise符合2.3.1规范
- 第二个是增加了一个x 为对象或者函数的判断，这一条判断主要对应2.3.3规范

对应的中文规范如下：
如果x是一个对象或者一个函数
1. 将then赋值为x.then
2. 如果在取x.then值时抛出了异常，则以这个异常作为原因将promise拒绝。
3. 如果then是一个函数，则以this调用then函数，则第一个参数是resovlePromise，第二个参数是rejectPromise，且：
    > 1. 当resolvePromise被以y为参数调用，执行[[Resolve]](promise,y)
    > 2. 当rejectPromise被以r为参数调用，则以r为原因将promise拒绝
    > 3. 如果resolvePromise和rejectPromise都被调用了，或者被调用了多次，则只有第一次有效，后面的忽略。
    > 4. 如果仔调用then时抛出了异常，则：
      3.4.1.如果resolvePromise或rejectPromise已经被调用了，则忽略它。
      3.4.2.否则，以e为
reason将promise拒绝。
1. 如果then不是一个函数，则以x为值fullfill promise。
```js
function resolvePromise(bridgepromise, x, resolve, reject) {
    //2.3.1规范，避免循环引用
    if (bridgepromise === x) {
        return reject(new TypeError('Circular reference'));
    }
    let called = false;
    //这个判断分支其实已经可以删除，用下面那个分支代替，因为promise也是一个thenable对象
    if (x instanceof MyPromise) {
        if (x.status === PENDING) {
            x.then(y => {
                resolvePromise(bridgepromise, y, resolve, reject);
            }, error => {
                reject(error);
            });
        } else {
            x.then(resolve, reject);
        }
        // 2.3.3规范，如果 x 为对象或者函数
    } else if (x != null && ((typeof x === 'object') || (typeof x === 'function'))) {
        try {
            // 是否是thenable对象（具有then方法的对象/函数）
            //2.3.3.1 将 then 赋为 x.then
            let then = x.then;
            if (typeof then === 'function') {
            //2.3.3.3 如果 then 是一个函数，以x为this调用then函数，且第一个参数是resolvePromise，第二个参数是rejectPromise
                then.call(x, y => {
                    if (called) return;
                    called = true;
                    resolvePromise(bridgepromise, y, resolve, reject);
                }, error => {
                    if (called) return;
                    called = true;
                    reject(error);
                })
            } else {
            //2.3.3.4 如果 then不是一个函数，则 以x为值fulfill promise。
                resolve(x);
            }
        } catch (e) {
        //2.3.3.2 如果在取x.then值时抛出了异常，则以这个异常做为原因将promise拒绝。
            if (called) return;
            called = true;
            reject(e);
        }
    } else {
        resolve(x);
    }
}
```
```js
MyPromise.prototype.catch = function(onRejected) {
    return this.then(null, onRejected);
}

try {
    module.exports = MyPromise
} catch (e) {}

```

all（）、race（）
```js
 Promise.all = function (promises) {
        //promises是一个promise的数组
        return new Promise(function (resolve, reject) {
            let result = []; //arr是最终返回值的结果
            let count = 0; // 表示成功了多少次
            for (let i = 0; i < promises.length; i++) {
                promises[i].then(function (data) {
                    result[i] = data;//有成功的就往数组里添加
                    if (++count === promises.length) {
                        resolve(result);//所有的promise都执行完，返回出去
                    }
                }, reject)
            }
        })
    }
    // 只要有一个promise成功了 就算成功。如果第一个失败了就失败了
    Promise.race = function (promises) {
        return new Promise((resolve, reject) => {
            for (var i = 0; i < promises.length; i++) {
                promises[i].then(resolve,reject) //只要有一个执行完就返回
            }
        })
    }

```
> all的原理就是返回一个promise，在这个promise中给所有传入的promise的then方法中都注册上回调，回调成功了就把值放到结果数组中，所有回调都成功了就让返回的这个promise去reslove，把结果数组返回出去，race和all大同小异，只不过它不会等所有promise都成功，而是谁快就把谁返回出去

参考资料
1. [一起学习造轮子（一）：从零开始写一个符合Promises/A+规范的promise](https://juejin.im/post/5b16800fe51d4506ae719bae#heading-22)
2. [Promise不会？？看这里！！！史上最通俗易懂的Promise！！！](https://juejin.im/post/5afe6d3bf265da0b9e654c4b)

## async await
Async/await 是以更舒适的方式使用 promise 的一种特殊语法，同时它也非常易于理解和使用。

### promise和await写法转换
```js
async function async1() {
    console.log('async1 start');
    await async2();
    console.log('async1 end');
}

// 相当于
async function async1() {
    console.log('async1 start');
    Promise.resolve(async2()).then(() => {
      console.log('async1 end');
  })
}
```
### Async function
让我们以 async 这个关键字开始。它可以被放置在一个函数前面

```js
async function f() {
  return 1;
}
```
这个函数总是返回一个 promise。其他值将自动被包装在一个 resolved 的 promise 中。

例如，下面这个函数返回一个结果为 1 的 resolved promise，让我们测试一下

```js
async function f() {
  return 1;
}

f().then(alert); // 1
```
……我们也可以显式地返回一个 promise，结果是一样的：
```js
async function f() {
  return Promise.resolve(1);
}

f().then(alert); // 1
```
所以说，async 确保了函数返回一个 promise，也会将非 promise 的值包装进去。

### Await

```js
// 只在 async 函数内工作
let value = await promise;
```
关键字` await `让 `JavaScript` 引擎等待直到 `promise `完成`（settle）`并返回结果。相比于 `promise.then`，它只是获取 `promise` 的结果的一个更优雅的语法，同时也更易于读写。

总结：

所以`await`后跟的表达式不同，有两种处理结果
1. 对于`promise`对象，await会阻塞函数执行，等待`promise`的`resolve`返回值，作为`await`的结果，然后再执行下下一个表达式
2. 对于非`promise`对象，比如箭头函数，同步表达式等等，`await`等待函数或者直接量的返回，而不是等待其执行结果



## promise题目

```js
const promise = new Promise((resolve, reject) => {
  resolve('success1')
  reject('error')
  resolve('success2')
})

promise
  .then((res) => {
    console.log('then: ', res)
  })
  .catch((err) => {
    console.log('catch: ', err)
  })

```
> 解释：构造函数中的 resolve 或 reject 只有第一次执行有效，多次调用没有任何作用。
   结论：**promise 状态一旦改变则不能再变**。
   
为什么说执行了resolve函数后"大部分情况"会进入fulfilled状态呢?考虑以下情况
```js
let promise=new Promise(resolve=>{
    resolve(Promise.reject('报错了'))
})

setTimeout(()=>{
    console.log(promise)
})
```
> 很多人认为promise中调用了resolve函数则这个promise一定会进入fulfilled状态,但是这里可以看到,即使调用了resolve函数,仍返回了一个拒绝状态的Promise,原因是因为如果在一个promise的resolve函数中又传入了一个Promise,会展开传入的这个promise
这里因为传入了一个拒绝状态的promise,resolve函数展开这个promise后,就会变成一个拒绝状态的promise,所以把resolve理解为决议比较好一点

   
参考资料
1. [Promise 必知必会（十道题）](https://juejin.im/post/5a04066351882517c416715d)
2. [近一万字的ES6语法知识点补充](https://juejin.im/post/5c6234f16fb9a049a81fcca5#heading-8)