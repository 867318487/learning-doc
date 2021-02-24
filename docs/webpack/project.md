# 工程化

## 2-1 玩转npm srcipt
### npm的常用命令
```shell
npm init     		//初始化工程
npm run      		//run script  执行package.json中的script脚本
npm install  		//安装依赖
npm update  		//升级依赖
npm bin					//查看bin文件目录
npm link				//将工程软链接到全局
npm publish			//发布包
npm deprecake 	//废弃包
```
#### npm init 初始化一个项目
在node开发中使用npm init会生成一个pakeage.json文件
```shell
# 在需要初始化的项目目录下执行
$ cd project
$ npm init project
```
#### npm run 执行脚本
**原理：**
npm 脚本的原理非常简单。每当执行npm run，就会自动新建一个 Shell，在这个 Shell 里面执行指定的脚本命令。
npm 允许在package.json文件里面，使用scripts字段定义脚本命令。
```json
{
  // ...
  "scripts": {
    "test": "node index.js"   //执行根路径下的index.js文件
  }
}
```
```shell
$ npm run test
# 等同于执行
$ node index.js  
```
注意点

1. 当前目录的node_modules/.bin子目录里面的所有脚本，都可以直接用脚本名调用，而不必加上路径。比如，当前项目的依赖里面有 Mocha，只要直接写mocha test就可以了。
1. 如果是普通文件需要加上路径。比如 `"test": "node src/index.js"`
1. npm 脚本的唯一要求就是可以在 Shell 执行，因此它不一定是 Node 脚本，任何可执行文件都可以写在里面。



#### npm scripts内部变量
```
$npm_package_name							#name in package.json
$npm_package_version					#version in package.json
$npm_package_config_var1			#config in package.json
```
示例：
输出 the  package is XXX
```json
//package.json
{
  "name": "testwebpack",
  "version": "1.0.0",
  "description": "工程化学习",
  "main": "index.js",
  "scripts": {
    "test": "node src/index.js"
  },
 //...
}
```
```javascript
//index.js
console.log("the package is "+process.env.npm_package_name)
```
执行  npm  test后输出
![image.png](https://cdn.nlark.com/yuque/0/2020/png/2362456/1607862958896-5ea38a39-fb87-421e-b336-54abf09823f1.png#align=left&display=inline&height=20&margin=%5Bobject%20Object%5D&name=image.png&originHeight=40&originWidth=362&size=3243&status=done&style=none&width=181)
#### npm script 传参
问题如何向封装过的命令传参
```json
{
  "scripts":{
    "server":"server ./build",
    "server:prod":"npm run server -- -l 80"
  }
}
```
实际的使用场景？？
#### npm script 钩子函数
npm 脚本有pre和post两个钩子。举例来说，build脚本命令的钩子就是prebuild和postbuild。
```json
//package.json
{
  //...
  "scripts": {
    "pretest":"echo before test",
    "test": "node src/index.js",
    "posttest":"echo after test"
  },
}
```
执行npm run build的时候，会**自动**按照下面的顺序执行。
```shell
npm run pretest && npm run test && npm run posttest
```
![image.png](https://cdn.nlark.com/yuque/0/2020/png/2362456/1607864384884-d68f7297-9d59-40ef-b1cc-62f2ed21afba.png#align=left&display=inline&height=220&margin=%5Bobject%20Object%5D&name=image.png&originHeight=440&originWidth=828&size=54274&status=done&style=none&width=414)
应用场景
发版前对版本号进行自增


#### npm script 执行顺序
并行执行（即同时的平行执行）
```shell
$ npm run script1.js & npm run script2.js
```
顺序执行（即只有前一个任务成功，才执行下一个任务）
```shell
$ npm run script1.js && npm run script2.js
```


其他补充：

1. `#！`这个符号通常在Unix系统的第一行开头中出现，用于指明这个脚本文件的解释程序。增加这一行是为了指定用node执行脚本文件。
1. 输入命令后，会有在一个新建的shell中执行指定的脚本，在执行这个脚本的时候，我们需要来指定这个脚本的解释程序是node。
1. `/usr/bin/env`就是告诉系统可以在PATH目录中查找node路径。

配置`#!/usr/bin/env node`是解决了不同的用户node路径不同的问题，可以让系统动态的去查找node来执行你的脚本文件。

参考资料
[npm scripts 使用指南](https://www.ruanyifeng.com/blog/2016/10/npm_scripts.html)
## 2-2 Bash简介和快速入门
### 概念
Shell 是一个用 C 语言编写的程序，它是用户使用 Linux 的桥梁。Shell 既是一种命令语言，又是一种程序设计语言。
bash是shell的语法解释器，Bash 也是大多数Linux 系统默认的 Shell。
shell解释器

1. bash
1. sh（linux默认的语法解释器）
1. zsh（mac下的解释器，交互比较友好）
1. cmd （windows下的解释器）



### 常用的bash命令
帮助命令
--help    man
```shell
# 帮助命令
$ man ps   # 可以查看ps所有的用法
# 文件管理
$ touch index.js # 新建一个文件
$ mkdir ./project  # 创建一个文件夹 
$ mkdir ./project2  # 创建一个文件夹(同上)
$ rmdir ./project2   # 删除一个文件夹
$ rm  shellTest.js   # 删除一个文件
$ mv indes.js ./main  # 将文件移动到 ./main这个路径
$ cp indes.js  ./main2  #将文件复制到./mian2这个路径
$ cat  ./package.json   #查看文件
$ head -n 10 ./package.json  #查看文件的前十行
$ tail -n 10 ./package.json  #查看文件的后十行
# 文件编辑  nano  vim
# 进程相关
$ ps  # 查看当前用户进程状态
$ ps -ax  # 查看所有进程
$ lsof -i # 查看打开的网络相关文件
$ top # 查看当前状态，比如系统负载，内存使用，使用进程相关
$ kill 45934 # 发送SIGTERM信号，在这里代表杀死pid为45934的进程
$ kill -9 45934 # SIGKILL,强杀进程

```
![image.png](https://cdn.nlark.com/yuque/0/2020/png/2362456/1607905743218-8dac9e99-8a2d-4a11-80c2-aa0c70f1741d.png#align=left&display=inline&height=79&margin=%5Bobject%20Object%5D&name=image.png&originHeight=158&originWidth=1566&size=157261&status=done&style=none&width=783)

学习资料
[《鸟哥的Linux私房菜（基础学习篇）》](http://cn.linux.vbird.org/)
[《The Linux Command Line》](http://linuxcommand.org/tlcl.php)


## 2-3 浅谈nodecli
### process.argv
```javascript
//process-args.js
process.argv.forEach((val,index) => {
    console.log(`${index}: ${val}`);
});
```
在js文件中打印以上内容
在控制台中执行
```shell
$node process-args.js
```
![image.png](https://cdn.nlark.com/yuque/0/2020/png/2362456/1608123218895-fb5d4d65-13cd-4a5c-9ba3-2cdee6640ca5.png#align=left&display=inline&height=65&margin=%5Bobject%20Object%5D&name=image.png&originHeight=130&originWidth=730&size=22557&status=done&style=none&width=365)
第一个输出node路径(process.execPath)
第二个输出正在执行文件的路径
第三、四个输出的是传入的参数


### commander
更方便的cli参数处理
```javascript
const {program} = require('commander');

program
.name('better-clone')  //通过name定义名称
.version('0.0.1')
.option('-v,--verbose','verbosity that can be increased')   //通过options定义一些配置

program
.command('clone <source> [destination]') //定义一个子命令
.option('-d,--depths<level>','git clone depths')
.description('clone a repository into a newly created directory')
.action((source,destination,cmdObj)=>{ //构造一个子命令的真实逻辑

})

program.parse(process.argv)
```
### inquirer.js 可视化交互
提供更灵活的cli交互方式
磨平平台间的差异
```javascript
var inquirer = require('inquirer');
inquirer
.prompt([//输入框和选择框
    {type:'input',name:'username',message:"what`s ur name"},
    {type:'checkbox',name:'gender',message:"whta ur gender?",choices:['male','female']}
  ])
  .then(answers => {
      console.log(`name  ${answers.username}`);
      console.log(`gender  ${answers.gender}`);
  })
  .catch(error => {
   //...
  });
```
输出
![image.png](https://cdn.nlark.com/yuque/0/2020/png/2362456/1608126219181-418b5587-cc4e-4ef9-91e6-a6015e0c14f3.png#align=left&display=inline&height=62&margin=%5Bobject%20Object%5D&name=image.png&originHeight=124&originWidth=476&size=14651&status=done&style=none&width=238)
### 拆解cli设计-以脚手架为例

1. 参数的输入，结果的输出

commanderjs（更方便的参数处理），inquirer（更好的交互），chalk（颜色高亮）

2. 模版在哪里维护

git仓库

3. 如何获取模版

git clone，使用execa或者shell.js调用
4.如何生成工程
模版引擎，handerbars


### 新一代脚手架
schemtics

- 可以做到语法级别的样板代码生成
- 引入了虚拟文件系统，可以保证写入原子性
- 支持多个schemtics之间的组合管道



## 3 规范先行（规范类暂不整理）
![image.png](https://cdn.nlark.com/yuque/0/2020/png/2362456/1608126956289-199e4788-c98a-4520-ae50-7686eb60a4ff.png#align=left&display=inline&height=473&margin=%5Bobject%20Object%5D&name=image.png&originHeight=946&originWidth=1392&size=199385&status=done&style=none&width=696)

- major：主版本，一般代表着breaking change，例如vue1.x和vue2.x
- minor：次版本，一般代表着新feature的出现
- patch：一般不包含新功能，知识bugfix或和功能关系不大的修改
- pre-release: 预发行版本，一般用于正式版本发行前的验证、联调和测试



## 4、测试相关
### 4-1 code review
### 4-2 测试基础
参考资料
[Jest](https://jestjs.io/docs/en/getting-started)
[更多Matchers](https://jestjs.io/docs/en/expect)
[更多Mock用法](https://jestjs.io/docs/en/mock-function-api)
[伊斯坦布尔测试覆盖率的实现原理](http://www.alloyteam.com/2019/07/13481/)


## 4-3 单元测试
## 4-4  端到端测试
常见框架
![image.png](https://cdn.nlark.com/yuque/0/2020/png/2362456/1608250544424-7ab01c79-1f81-497f-8f54-7b2ec260cd07.png#align=left&display=inline&height=414&margin=%5Bobject%20Object%5D&name=image.png&originHeight=828&originWidth=1414&size=439117&status=done&style=none&width=707)
![image.png](https://cdn.nlark.com/yuque/0/2020/png/2362456/1608250587462-5fb11f10-f016-4573-b031-ff3695329e87.png#align=left&display=inline&height=320&margin=%5Bobject%20Object%5D&name=image.png&originHeight=640&originWidth=1176&size=287058&status=done&style=none&width=588)
```javascript
//index.spec.js
describe('Main Process', () => {
  beforeEach(()=>{
    cy.visit('http://localhost:8080/');//访问应用的地址  
  })
  it('Make a Todo', () => {
    cy.get('input').first().type('some things');//获取第一个输入框，输入内容
    cy.get('.v-input__append-outer .v-icon--link').click();//模拟点击添加
    cy.get('.v-list>div .v-list__title__content').first().should('have.text','some things')//通过断言判断是否添加成功
  })
})
```
可视化界面
![image.png](https://cdn.nlark.com/yuque/0/2020/png/2362456/1608362083140-5ddd0813-109a-47ca-ace7-9290653d24cb.png#align=left&display=inline&height=506&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1012&originWidth=1998&size=711596&status=done&style=none&width=999)
## 5-工程设计
本章节主要讲设计规范不详细记录
**参考链接**
[Git submodule的坑](https://blog.devtang.com/2013/05/08/git-submodule-issues/)
[git subtree](https://github.com/apenwarr/git-subtree/)
[npm v7 Series - Introduction](https://blog.npmjs.org/post/617484925547986944/npm-v7-series-introduction)
[https://blog.npmjs.org/post/617484925547986944/npm-v7-series-introduction  ](https://blog.npmjs.org/post/617484925547986944/npm-v7-series-introduction)
[NX](https://nx.dev/)
## 6-1 构建简史
## 6-2 不得不提的babel
### 回顾AST
AST是一种可遍历、描述代码的树状结构。利用AST可以方便的分析代码的结构和内容。
代码和AST的转换如下：
![image.png](https://cdn.nlark.com/yuque/0/2020/png/2362456/1609159016540-5dc277e1-2afe-4fee-b9f0-74a5ec060590.png#align=left&display=inline&height=562&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1124&originWidth=1976&size=1138391&status=done&style=none&width=988)
AST的生成过程需要复习

### 基础编译理论
![image.png](https://cdn.nlark.com/yuque/0/2020/png/2362456/1609159452728-a447964d-b4ee-49c2-ad6b-590ee27cb804.png#align=left&display=inline&height=442&margin=%5Bobject%20Object%5D&name=image.png&originHeight=884&originWidth=1882&size=657981&status=done&style=none&width=941)
**词法分析**：按照某一语言的规则解析字符串。将人为书写的代码转换成定义这门语言的基本单位。这个基本单位为token。
**语法分析**：通过token生成初始的AST结构。
**语义分析**：遍历这个AST对节点的属性进行补全。对分析的结果进行增强。
**中间代码生成**：将AST生成和平台无关的代码。
**目标代码生成**：将中间代码转换成目标平台的代码。如果没有多个目标平台，可忽略“中间代码生成”这一步骤。**
### Babel中的编译
babel也是编译器，输入高版本代码，输出低版本代码。
#### babel的工作步骤

1. 解析：解析代码，生成AST
1. 变换：操作AST，修改其内容
1. 生成：根据AST生成新的代码



代码演练
1、将代码转换成token
```javascript
let input  = '(add 2 (subtract 4 2))';

function tokenizer(input) {

  let current = 0;

  let tokens = [];

//通过循环，排除空格等无用的信息。输入的是字符串
  while (current < input.length) {
    //每次取一个字符串进行操作，然后累加计数器
    let char = input[current];
    if (char === '(') {
      tokens.push({
        type: 'paren',
        value: '(',
      });
      // 累加然后继续循环
      current++;
      continue;
    }
    
    //...处理右括号

    //如果是空格忽略，累加继续循环
    let WHITESPACE = /\s/;
    if (WHITESPACE.test(char)) {
      current++;
      continue;
    }

    let NUMBERS = /[0-9]/;
    if (NUMBERS.test(char)) {
      let value = '';
      while (NUMBERS.test(char)) {//将连续的数字存为一个字段
        value += char;
        char = input[++current];
      }
      tokens.push({ type: 'number', value });//将数字的最终结果存起来
      continue;
    }

    //...处理字符串

    let LETTERS = /[a-z]/i;
    if (LETTERS.test(char)) {//将连续的字母存为一个字段
      let value = '';
      while (LETTERS.test(char)) {
        value += char;
        char = input[++current];
      }
      tokens.push({ type: 'name', value });//只存一次

      continue;
    }

  }

 //返回最终数组形式的token
  return tokens;
}
```
处理结果：
![image.png](https://cdn.nlark.com/yuque/0/2020/png/2362456/1609161838860-8ac37cba-91d4-4a8a-b02c-98bab092d052.png#align=left&display=inline&height=180&margin=%5Bobject%20Object%5D&name=image.png&originHeight=360&originWidth=602&size=55147&status=done&style=none&width=301)


2、token转换成AST语法树
```javascript
function parser(tokens) {
    //全局的技术变量，保证不重复
    let current = 0;

    function walk() {
        let token = tokens[current];
        //数字或者字母直接返回
        if (token.type === 'number') {
            current++;
            return {
                type: 'NumberLiteral',
                value: token.value,
            };
        }
        if (token.type === 'string') {
            current++;
            return {
                type: 'StringLiteral',
                value: token.value,
            };
        }

        //如果是左括号开头
        if (
            token.type === 'paren' &&
            token.value === '('
        ) {
            token = tokens[++current];
            //取左括号临近的一个值作为函数名
            let node = {
                type: 'CallExpression',
                name: token.value,
                params: [],
            };
            //取下一个变量
            token = tokens[++current];
            while (
                (token.type !== 'paren') ||
                (token.type === 'paren' && token.value !== ')')
                ) {
                //在遇到下一个右括号之前所有的元素都放在函数名下当做参数
                node.params.push(walk());
                token = tokens[current];
            }

            current++;
            return node;
        }
        throw new TypeError(token.type);
    }

    let ast = {
        type: 'Program',
        body: [],
    };

    //循环遍历数组，遍历成树形结构
    while (current < tokens.length) {
        ast.body.push(walk());
    }

    return ast;
}
```
处理结果
![image.png](https://cdn.nlark.com/yuque/0/2020/png/2362456/1609232234352-7991c1f4-b068-4ddd-b738-61c68fc33c60.png#align=left&display=inline&height=185&margin=%5Bobject%20Object%5D&name=image.png&originHeight=185&originWidth=263&size=39483&status=done&style=none&width=263)
```javascript
const ast = {
  type: 'Program',
  body: [{
    type: 'CallExpression',
    name: 'add',
    params: [{//2个参数
      type: 'NumberLiteral',
      value: '2'
    }, {
      type: 'CallExpression',
      name: 'subtract',
      params: [{//2个参数
        type: 'NumberLiteral',
        value: '4'
      }, {
        type: 'NumberLiteral',
        value: '2'
      }]
    }]
  }]
};
```
3、transformation转换
Traverser函数：深度优先遍历AST树
Transformer函数：在遍历到每一个节点时调用，将旧AST转换成一颗新树


4、code generator
深度优先地遍历新的AST树，将每个节点依次组合成新的代码
总结：

1. input     =》tokenizer    =》toknes
1. tokens   =》parser        =》ast
1. ast        =》transformer =》newAst
1. newAst  =》generator    =》output



**扩展资料**
[AST   explorer（ast转换）](https://astexplorer.net/)
[the-super-tiny-compiler项目（一个小型的babel）](https://github.com/jamiebuilds/the-super-tiny-compiler)
[中国大学慕课：编译原理 哈尔滨工业大学：](http://www.icourse163.org/course/HIT-1002123007)
## 6-3 babel基本概念
### babel的作用
语法转换：高版本转成低版本
polyfill：让老环境支持新的API
源码修改 ：去除flow/typeScript代码中的类型标识


### Syntax和feature的区别
Syntax
语言级的某一种概念的写法，不可被语言中其他概念实现。例如：箭头函数，class类，es模块。
Feature
实例方法，静态方法，全局对象，可以被我们自己实现。例如：promise，object.keys，[].includes.


### plugin/preset/env的区别
#### plugin
插件，babel本身不会对代码做任何修改，所有的功能都靠插件实现。
#### preset
一组插件的集合。官方的preset：@babel/preset-env、@babel/preset-flow、@babel/preset-react
stage-x
ECMAScript语言新特性会经历5个阶段后才会被正式宣布
stage-0 提案刚提出的时候，仅是个想法
stage-1 大家发现这个歌是个值得取实现的提案
stage-2 草稿阶段：形成最初的规范文档
stage-3 候选人阶段
stage-4  结束阶段，明年会正式发布
以上在babel7中已经被废弃

#### env
@babel/preset-env 是一种更加只能的preset，可以根据目标环境，快速配置babel
```javascript
{
  "targets":"> 0.25%, not dead",
}
```
## 6-4 babel
### babel cli
在加载js文件前按照配置进行转换
```shell
babel src --out-dir lib --ignore "src/**/*.spec.js"
babel-node --inspect --presets @babel/preset-env -- script.js --inspect
```
### babel的配置
项目根目录的 .babelrc.json:对整个项目生效
工程根目录的 babel.config.json:对整个工程生效（可以跨项目）
package.json的 babel字段  相当于.babelrc.json

plugin的执行顺序
plugin在preset之前执行，plugin放一些比较新的特性，preset一般是比较稳定的特性，保证新特性先被转换。
plugin之间的顺序是从前往后执行。


preset的执行顺序
preset在plugin之后执行。
preset之间的顺序是从后往前执行。


preset-env的配置
主要是usebuiltins和target两个配置
usebuiltins用来配置polyfill
target来告诉preset-env要选择那些插件

usebuiltins的配置
有3个值  “usage”、“entry”，false（默认）
用于自动注入polyfill代码
1、false：什么也不做，不自动注入polyfill
2、entry：根据环境配置自动注入polyfill
3、usage：根据实际使用自动注入polyfill

polyfill
![image.png](https://cdn.nlark.com/yuque/0/2020/png/2362456/1609253807203-79b92192-9098-4c11-aadd-1ab333cafa54.png#align=left&display=inline&height=289&margin=%5Bobject%20Object%5D&name=image.png&originHeight=578&originWidth=1642&size=298121&status=done&style=none&width=821)
core-js的使用
![image.png](https://cdn.nlark.com/yuque/0/2020/png/2362456/1609254226643-d5757b5e-7e52-4d70-9669-b72c15a2637e.png#align=left&display=inline&height=471&margin=%5Bobject%20Object%5D&name=image.png&originHeight=942&originWidth=1694&size=527411&status=done&style=none&width=847)
![image.png](https://cdn.nlark.com/yuque/0/2020/png/2362456/1609254323390-bc5255fa-6753-4d35-beca-112c5f922d92.png#align=left&display=inline&height=413&margin=%5Bobject%20Object%5D&name=image.png&originHeight=826&originWidth=2010&size=729314&status=done&style=none&width=1005)


![image.png](https://cdn.nlark.com/yuque/0/2020/png/2362456/1609253946402-e0846b04-81d5-4404-8390-bde592a071c1.png#align=left&display=inline&height=498&margin=%5Bobject%20Object%5D&name=image.png&originHeight=996&originWidth=1906&size=915899&status=done&style=none&width=953)


![image.png](https://cdn.nlark.com/yuque/0/2020/png/2362456/1609254081109-6b5f3cd2-73f0-4bc5-ab7f-7d43a14c677e.png#align=left&display=inline&height=437&margin=%5Bobject%20Object%5D&name=image.png&originHeight=874&originWidth=1158&size=374202&status=done&style=none&width=579)


[browserlist项目地址](https://github.com/browserslist/browserslist)
[compat-table项目地址](https://github.com/kangax/compat-table)


## 6-5 babel插件开发
### babel插件开发的本质
从代码到AST
将代码转换成AST树形结构


![image.png](https://cdn.nlark.com/yuque/0/2020/png/2362456/1609331760463-65659d84-e438-43bf-8f24-ca31a3eb9636.png#align=left&display=inline&height=525&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1050&originWidth=1896&size=643594&status=done&style=none&width=948)
#### AST节点

1. AST每一层都拥有相同的结构，我们称之为节点
1. 一个AST可以由单一的节点或者成百上千个节点构成
1. 他们组合在一起可以描述用于静态分析的程序语法

![image.png](https://cdn.nlark.com/yuque/0/2020/png/2362456/1609331960378-1a945ec9-61ce-40dd-8806-c21c3701eeb9.png#align=left&display=inline&height=464&margin=%5Bobject%20Object%5D&name=image.png&originHeight=928&originWidth=738&size=240602&status=done&style=none&width=369)
#### babel也是编译器
输入高版本ES代码，输出符合我们要求的低版本ES代码，例如：ES7-》ES5
#### babel的工作步骤
根据babel文档，工作步骤主要分为3步

1. 解析：解析代码，生成AST
1. 变换：操作AST，修改内容
1. 生成：根据AST生成新的代码



#### 访问者模式
转换AST：先对它进行递归的树形遍历
遍历AST的过程，就是不断的访问各个节点的过程
babel的插件使用了访问者模式，有2次访问的机会，一个是进入（向下遍历）的时候，一个是出去（遍历到最后向上返回）的时候
![image.png](https://cdn.nlark.com/yuque/0/2020/png/2362456/1609333230949-db6fd4c7-39e4-4f3f-9a83-cc636d797678.png#align=left&display=inline&height=281&margin=%5Bobject%20Object%5D&name=image.png&originHeight=562&originWidth=744&size=187098&status=done&style=none&width=372)
访问者模式都自带两个参数，path和state
path是我们对节点的引用
![image.png](https://cdn.nlark.com/yuque/0/2020/png/2362456/1609333649266-998e7643-65b6-48cd-b0d0-83f7c5577962.png#align=left&display=inline&height=280&margin=%5Bobject%20Object%5D&name=image.png&originHeight=560&originWidth=1704&size=273921&status=done&style=none&width=852)
state 插件的状态
比如plugin的信息、plugin传入的配置参数、甚至处理过程中的自定义状态
（左边图配置信息，右边图在babel中如何取到）
![image.png](https://cdn.nlark.com/yuque/0/2020/png/2362456/1609333833715-9c8d5427-3fe0-4d09-a93a-bba26baface5.png#align=left&display=inline&height=222&margin=%5Bobject%20Object%5D&name=image.png&originHeight=444&originWidth=1630&size=271622&status=done&style=none&width=815)
babel插件的完整结构
![image.png](https://cdn.nlark.com/yuque/0/2020/png/2362456/1609334180268-e787aa47-fb64-478b-b2e2-21a5c33264ac.png#align=left&display=inline&height=409&margin=%5Bobject%20Object%5D&name=image.png&originHeight=818&originWidth=1888&size=479217&status=done&style=none&width=944)
#### babel插件的开发工具
![image.png](https://cdn.nlark.com/yuque/0/2020/png/2362456/1609334227797-45720e4d-b324-4be1-8614-c8c44abe49ad.png#align=left&display=inline&height=372&margin=%5Bobject%20Object%5D&name=image.png&originHeight=744&originWidth=1656&size=664462&status=done&style=none&width=828)
1、对比转换前和转换后的AST结构区别
todo：自己写一个bable插件


## 6-6 webpack设计思想
### Tapable插件体系
webpack本身有很多hook钩子，插件注册自己感兴趣的hook，webpack在相应的时机调用他们。tapable提供了这样一个插件体系。
![image.png](https://cdn.nlark.com/yuque/0/2020/png/2362456/1609373631738-a468c6ce-e354-4728-9670-392d8fec946c.png#align=left&display=inline&height=258&margin=%5Bobject%20Object%5D&name=image.png&originHeight=516&originWidth=994&size=544867&status=done&style=none&width=497)
Tapable的使用
```javascript
const {SyncHook} from require('tapable);
//创建实例
const syncHook = new SyncHook(["name","age"]);
//注册事件
syncHook.tap("1",(name,age)=>{console.log("1",name,age)})
syncHook.tap("2",(name,age)=>{console.log("2",name,age)})
syncHook.tap("3",(name,age)=>{console.log("3",name,age)})
//调用
syncHook.call('harry potter',18);
//输出
//1 harry potter  18
//2 harry potter  18
//3 harry potter  18
```


### webpack工作流程

1. 初始化配置（webpak配置初始化，tapable体系初始化，主要初始化compiler对象）
1. 准备工作（初始化plugin等。初始化plugin的过程就是依次调用plugin的apply的方法的过程。plugin的apply方法就是在实例化compiler对象上注册每个钩子的回调函数）
1. resolve源文件，构建module（遍历各个源文件构建module）
1. 生成chunk
1. 构建资源
1. 最终文件生成

说明：从第三步之后的每一步都有plugin注册hook函数的方式参与


## 6-6 webpack主要概念
entry：webpack分析依赖的入口，可以有多个
output：用来指示webpack将打包后的bundle文件放在什么位置
loader：能够让webpack处理非js/json的文件，将一切非js的文件转换为js模块，以便webpack分析依赖关系。
plugin：插件负责提供更高级的构建、打包工作。
mode：指明当前的构建任务所处的环境，让webpack针对特定环境启动一些优化项


webpack.config.js webpack的配置文件：指示webpack干哪些活，当运行webpack指令时，加载里面的配置。所有构建工具都是基于nodejs平台运行的。模块化默认采用commonjs。
### 打包样式资源
webpack只能识别js文件，想要处理其他文件需要通过loader进行处理
```javascript
//webpack.config.js
const {resolve} =require('path') //nodejs的方法
module.exports={
    //文件入口
    entry:'./src/index.js',
    output:{
        filename:'build.js',//输出的文件名
        //__dirname nodejs的变量，代表当前文件目录的绝对路径
        path:resolve(__dirname,'dist')
    },
    module:{
        rules:[//loader的配置
            {//对命中的匹配的文件进行解析
                test:/\.css$/,//正则匹配
                //使用哪些loader
                use:[//loader执行顺序从右到左，从下到上
                    //创建style标签，将js的样式资源插入进去，添加到head中生效
                    'style-loader',
                    //将css文件变成commonjs模块加载js中，里面的内容是样式字符串
                    'css-loader'
                ],
            }
        ],
    },
    //模式
    mode:'development',
}
```
```javascript
//index.js文件
//引入样式资源
import './index.css'

```
```shell
npm i webpack  webpack-cli -D
npm i css-loader style-loder -D
npm i less less-loader -D

```
整个解析流程
1、从入口 entry-》index.js
2、index.js中遇到 引入的index.css样式文件，通过loader进行解析


### 打包html资源
```javascript
const {resolve} =require('path') //nodejs的path方法
const htmlWebpackPlugin = require('html-webpack-plugin')
module.exports={
    //文件入口
    entry:'./src/index.js',
    output:{
        filename:'build.js',//输出的文件名
        path:resolve(__dirname,'dist')
    },
    module:{
    //。。。
    },
    plugins:[//插件需要先引用再使用
        //plugins的配置
        //html-webpack-plugin
        new htmlWebpackPlugin({
            template:'./src/index.html'
        })
    ],
   //。。。
}
```
功能：默认会创建一个空的html，自动引入输出的的所有资源（css/js）。当前的配置会将打包后的build.js引入。


### 打包图片资源
```javascript
const {resolve} =require('path') //nodejs的path方法
const htmlWebpackPlugin = require('html-webpack-plugin')
module.exports={
    //文件入口
    entry:'./src/index.js',
    output:{
        publicPath: './',//指定资源的公共路径
        filename:'build.js',//输出的文件名
        path:resolve(__dirname,'dist')
    },
    module:{
        rules:[//loader的配置
            //...css,less配置忽略
             {//对命中的匹配的文件进行解析
                test:/\.(png|jpg|jpeg|gif)$/,
                //使用哪些loader
                //下载url-loader、file-loader（url-loader依赖于他）
                loader:'url-loader',
                options:{//图片大小于8kb会被转换成base64
                    limit:8*1024,
                    name:'[hash:10].[ext]',
                },
    
            },{
                test:/\.html$/,
                //处理html文件中的img图片（负责引入img，从而能被url-loader进行处理）
                //需要配置一个publicPath，指定访问的公共路径
                loader:'html-loader',
            }
        ],
    },

    plugins:[
        new htmlWebpackPlugin({
            template:'./src/index.html'
        })
    ],
   //...
}
```
在option中配置limit，图片大小于8kb会被转换成base64。
优点：减少请求数量（减轻服务器压力）
缺点：图片体积会更大（文件请求速度更慢）
name  名字取10位hash值加扩展名
如果图片在项目中被引用多次，也不会被打包多次


### 打包其他资源
```javascript
//。。。
module.exports={
  //。。。。
    module:{
        rules:[//loader的配置
       //。。。。
            {//打包其他资源（除了html/js/css资源以外的资源，loader中又要匹配的都要一一排除）
                exclude:/\.(css|js|html)$/,
                loader:'file-loader',
                options:{
                    name:'[hash:10].[ext]',
                },
            }],
    },
//。。。。
}
```
### devserver
```javascript
const {resolve} =require('path') //nodejs的path方法
const htmlWebpackPlugin = require('html-webpack-plugin')
module.exports={
   
    devServer:{
        //项目构建后路径
        contentBase:resolve(__dirname,'dist'),
        //开启giz压缩
        compress:true,
        //端口号
        port:8080,
        //自动打开浏览器
        open:true,
    }
    
}
```
 开发服务器  devserver:自动编译，自动打开浏览器，自动刷新浏览器
 特点：只会在内存中编译打包，不会有任何输出
 启动devServer指令为 npx webpack-dev-server （webpack5中 为 npx webpack server，但是目前有兼容问题，建议用webpack4.x）


### 开发环境配置（总结）
```javascript
const {resolve} =require('path') //nodejs的path方法
const htmlWebpackPlugin = require('html-webpack-plugin')
module.exports={
    //文件入口
    entry:'./src/index.js',
    output:{
        publicPath: './',
        filename:'js/build.js',//输出的文件名，输出到打包路径的js文件下
        //__dirname nodejs的变量，代表当前文件目录的绝对路径
        path:resolve(__dirname,'dist')
    },
    module:{
        rules:[//loader的配置
            {//对命中的匹配的文件进行解析
                test:/\.css$/,
                //使用哪些loader
                use:[//执行顺序从右到左，从下到上
                    //创建style标签，将js的样式资源插入进去，添加到head中生效
                    'style-loader',
                    //将css文件变成commonjs模块加载js中，里面的内容是样式字符串
                    'css-loader'
                ],
            },
            {//对命中的匹配的文件进行解析
                test:/\.less$/,
                //使用哪些loader
                use:[//执行顺序从右到左，从下到上
                    //创建style标签，将js的样式资源插入进去，添加到head中生效
                    'style-loader',
                    //将css文件变成commonjs模块加载js中，里面的内容是样式字符串
                    'css-loader',
                    //将less转换成css
                    'less-loader',
                ],
            },
             {//对命中的匹配的文件进行解析
                test:/\.(png|jpg|jpeg|gif)$/,
                //使用哪些loader
                //下载url-loader、file-loader（url-loader依赖于他）
                loader:'url-loader',
                options:{//图片大小于8kb会被转换成base64
                    //优点：减少请求数量（减轻服务器压力）
                    //缺点：图片体积会更大（文件请求速度更慢）
                    limit:8*1024,
                    name:'[hash:10].[ext]',
                    outputPath:'imgs'  //输出到打包目录的imgs的路径下
                },
    
            }
            ,{
                test:/\.html$/,
                //处理html文件中的img图片（负责引入img，从而能被url-loader进行处理）
                //需要配置一个publicPath，指定访问的公共路径
                loader:'html-loader',
            }
            ,{//打包其他资源（除了html/js/css资源以外的资源）
                exclude:/\.(css|less|js|html|png|jpg|jpeg|gif)$/,
                loader:'file-loader',
                options:{
                    name:'[hash:10].[ext]',
                    outputPath:'media'  
                },
            }
        ],
    },

    plugins:[
        //plugins的配置
        //html-webpack-plugin
        //功能：默认会创建一个空的html，自动引入输出的的所有资源（css/js）
        new htmlWebpackPlugin({
            template:'./src/index.html'
        })
    ],
    
    //模式
    mode:'development',

    //开发服务器  devserver:自动编译，自动打开浏览器，自动刷新浏览器
    //特点：只会在内存中编译打包，不会有任何输出
    //启动devServer指令为 npx webpack devser 
    devServer:{
        //项目构建后路径
        contentBase:resolve(__dirname,'dist'),
        //开启giz压缩
        compress:true,
        //端口号
        port:8080,
        //自动打开浏览器
        open:true,
    }

}
```
1、通过output、outputPath来指定输出的路径
2、css由于使用了css-loader会将css提取到js中，一起打包在js文件里


### 构建环境介绍
目前开发环境配置的问题
1、css样式文件是通过css-loader插入到js文件中的，这样会导致js文件的体积较大，下载速度很慢。由于是先加载js，然后通过创建style标签插入到页面中，会造成闪屏现象。
解决：将css代码提取出来
2、对代码进行压缩处理
3、css需要加一些兼容，加前缀
说明：由于以上处理比较费时，都放在开发环境里处理


### 生产环境-提取css文件成单独文件
```javascript
const {resolve} = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports={
    //...
    module:{
        rules:[
            {
                test:/\.css$/,
                use:[
                    //创建style标签，将样式放入
                    // 'style-loader',
                   //**这个loader取代style-loader。作用：提取js中的css成单独文件
                    MiniCssExtractPlugin.loader,
                     //将css文件整合到js中
                    'css-loader'
                ],
            }
        ]
    },
    plugins:[
        new HtmlWebpackPlugin({
            template:'./src/index.html'
        }),
        new MiniCssExtractPlugin({
            filename:'css/build.css' //**对输出的css进行重命名
        }),
    ],
    mode:'development',
}
```
1、MiniCssExtractPlugin.loader取代style-loader。作用：提取js中的css成单独文件。
打包后的结果
```html
<link href="css/build.css" rel="stylesheet">
```
通过link标签引入，不再通过style标签引入。不会出现闪屏现象。css文件和js文件分开了，js文件的体积变小了，解析速度也变快了。


### css兼容性处理
```javascript
const {resolve} = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
//设置 nodejs环境变量
process.env.NODE_ENV = 'development'
module.exports={
    entry:'./src/index.js',
    output:{
        filename:'js/built.js',
        path:resolve(__dirname,'build')
    },
    module:{
        rules:[
            {
                test:/\.css$/,
                use:[
                    MiniCssExtractPlugin.loader,
                     //将css文件整合到js中
                    'css-loader',
                    /**
                     * css兼容性处理：会自动读取postcss.config.js中的配置
                     */
                    'postcss-loader'
                ],
            },
          //...
        ]
    },
    plugins:[
        new HtmlWebpackPlugin({
            template:'./src/index.html'
        }),
        new MiniCssExtractPlugin({
            //对输出的css进行重命名
            filename:'css/build.css'
        }),
    ],
    mode:'development',
}     
```
postcss.config.js
```javascript
module.exports={
    plugins:[
        [
            "postcss-preset-env",
            {
                //options
            }
        ],
    ],
}
```
css样式
```css
#box1{
    width: 100px;
    height: 50px;
    background-color: blueviolet;
    display: flex;
    backface-visibility: hidden;
}
```
打包后，自动增加了前缀
```css
#box1{
    width: 100px;
    height: 50px;
    background-color: blueviolet;
    display: flex;
    -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
}
```
疑问：如果设置根据浏览器版本进行兼容
[https://www.dazhuanlan.com/2020/03/12/5e69f574c1bef/](https://www.dazhuanlan.com/2020/03/12/5e69f574c1bef/)


### 压缩css
```css
//...
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')

//设置 nodejs环境变量
process.env.NODE_ENV = 'development'
module.exports={
   //...
    plugins:[
        //...
        new OptimizeCssAssetsWebpackPlugin(),//压缩css
    ],
    mode:'development',
}
```
对css文件进行压缩，把css压缩成一行。体积也有减少。


### 压缩html和js
```css
const {resolve} = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')

//设置 nodejs环境变量
process.env.NODE_ENV = 'development'
module.exports={
		//...	
    plugins:[
        new HtmlWebpackPlugin({
            template:'./src/index.html',
            minify:{
                collapseWhitespace:true,//移除空格
                removeComments:true,//移除注释
            }
        }),
        new MiniCssExtractPlugin({
            //对输出的css进行重命名
            filename:'css/build.css'
        }),
        new OptimizeCssAssetsWebpackPlugin(),
    ],
    //生产环境下会自动压缩js代码
    mode:'production',
}
```
1、压缩js代码：只要开启生产环境，就会自动压缩代码。
2、压缩html代码：通过minify选项，把html代码压缩成一行。html标签不需要进行兼容性处理。


### 生产环境基本配置（总结）
```javascript
const {resolve} = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')//把css单独提取成文件
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin') //压缩css

// // 定义nodejs环境变量：决定使用browserlist的哪个环境(eslint中用到)
// process.env.NODE_ENV='production';

//复用loader
const commonCssLoader=[
     //创建style标签，将样式放入
     // 'style-loader',
     //这个loader取代style-loader。作用：提取js中的css成单独文件
     MiniCssExtractPlugin.loader,
    //将css文件整合到js中
    'css-loader',
     /**
     * css兼容性处理：npm install --save-dev postcss-loader postcss
     */
    'postcss-loader'
];

//设置 nodejs环境变量
process.env.NODE_ENV = 'development'
module.exports={
    entry:'./src/index.js',
    output:{
        filename:'js/built.js',
        path:resolve(__dirname,'build')
    },
    module:{
        rules:[
            {
                test:/\.css$/,
                use:[...commonCssLoader],
            },
            {
                test:/\.less$/,
                use:[...commonCssLoader,'less-loader'],
            },
            /*
                正常来讲，一个文件只能被一个loader处理
                当一个文件要被多个loader处理，那么一定要指定loader执行的先后顺序：
                先执行eslint再执行babel
            */
            // {
            //     //在package.json中eslintConfig --> airbnb
            //     test:/\.js$/,
            //     exclude:/node_modules/,
            //     //优先执行
            //     enforce:'pre',
            //     loader:'eslint-loader',
            //     options:{
            //         fix:true,
            //     },
            // },
            //npm install -D babel-loader @babel/core @babel/preset-env webpack
            {
                //对js做兼容性处理
                test:/\.js$/,
                exclude:/node_modules/,
                loader:'babel-loader',
                options:{
                    presets:[
                        '@babel/preset-env'
                    ]
                }
            },
            {
                test:/\.(jpg|png|gif)$/,
                loader:'url-loader',
                options:{
                    limit:8*1024,
                    name:'[hash:10].[ext]',
                    outputPath:'imgs',
                    esModule:false,
                }
            },
            {//处理html中的图片
                test:/\.html$/,
                loader:'html-loader'
            },
            {
                exclude:/\.(js|css|less|html|jpg|png|gif)/,
                loader:'file-loader',
                options:{
                    outputPath:'media',
                }
            }
        ]
    },
    plugins:[
        //html的压缩
        new HtmlWebpackPlugin({
            template:'./src/index.html',
            minify:{
                collapseWhitespace:true,//移除空格
                removeComments:true,//移除注释
            }
        
        }),
        //css的提取
        new MiniCssExtractPlugin({
            //对输出的css进行重命名
            filename:'css/build.css'
        }),
        //css的压缩
        new OptimizeCssAssetsWebpackPlugin(),
    ],
    //生产环境下会自动压缩js代码
    mode:'production',
}
```
1、压缩js、css、图片文件
2、js语法转换（es6及以上的语法）、css兼容性处理


### 性能优化介绍
#### 开发环境性能优化

- 优化打包构建速度

      HMR

- 优化代码调试

      source-map
#### 生产环境性能优化

- 优化打包构建速度

oneof
babel缓存（优化构建速度）
多进程打包  
externals（不打包，使用cdn）
dll（单独打包好第三方库直接用）

- 优化代码运行的性能

缓存（hash｜chunkhash｜contenthash）
tree shaking
code split
懒加载/预加载
pwa


### HMR
#### 背景
自动编译在开发环境通过`npx webpack-dev-server  `启动
存在的问题：
在没有开启XHR之前，修改了css文件js文件也会被重新打包。一个模块发生变换，其他都重新打包了。浪费资源，如果模块比较多的时候，会导致速度变慢。
解决：
开启HMR热模块替换


#### HMR如何开启
启用这个功能很简单, 只需要修改一下 webpack.config.js 的配置, 使用 webpack 内置的 HMR 插件就可以了**
```javascript
//webpack.config.js
devServer:{
     //项目构建后路径
     contentBase:resolve(__dirname,'dist'),
     //开启giz压缩
     compress:true,
     //端口号
     port:8080,
     //自动打开浏览器
     open:true,
     //***开启HMR***
     hot:true,
}
```
HMR:hot module replacement 热模块替换/模块热替换
作用：一个模块发生变化，只会重新打包这一个模块（而不是打包所有模块）
极大提升构建速度


- 样式文件：可以使用HMR功能：因为style-loader 内部实现了（需要在loader中用style-loader处理）
- js文件：默认不能使用HMR功能（需要修改js代码，支持HMR）

** 注意：HMR功能对js处理，只能处理非入口js文件的其他文件**

- html文件：默认不能使用HMR功能，同时会导致问题：html文件不能热更新了（html开发的时候只有一个文件，不用做HMR功能，改变的时候都变了）

**解决：修改entry入口，将html文件引入**


**html启用热更新**
```javascript
entry:['./src/index.js','./src/index.html'],
```
**js启用热更新**
启用 webpack 内置的 HMR插件后, module.hot 接口就会暴露在 index.js 中, 接下来需要在 index.js 中配置告诉 webpack 接受HMR的模块( print.js ):
```javascript
//index.js中监听引入的依赖文件
if (module.hot) {
  //一旦module.hot为true，说明开启了HMR功能。=》让HMR功能代码生效
    module.hot.accept('./print.js', function() { 
      //方法会监听print.js文件的变化，一旦发生变化，其他默认不会重新打包构建
        console.log('Accepting the updated printMe module!');
      //会执行后面的回调函数
        printMe();
    })
}
```
### sourcemap
```javascript
 //webpack.config.js
devtool:'source-map'
```
sourcemap是一种 提供源代码到构建后代码映射技术（如果构建后代码出错了，通过映射可以追踪代码错误）
[inline-|hidden-|eval-][nosources-][cheap-[module-]]source-map


- source-map：外部

错误代码准确信息 和源代码的错误位置

- inline-source-map：内联

只生成一个内联source-map
错误代码准确信息和源代码的错误位置

- hidden-source-map：外部

错误代码错误原因，但是没有错误位置
不能追踪源代码错误，只能提示到构建后代码的错误位置

- eval-source-map：内联

每一个文件都生成对应的source-map，都在eval

- nosources-source-map：外部

错误代码准确信息，但是没有任何源代码信息

- cheap-source-map：外部

错误代码准确信息和源代码的错误位置
只能精确行

- cheap-module-source-map：外部

错误代码准确信息和源代码的错误位置


内联和外部的区别：1、外部生成了文件，内联没有 2、内联构建速度更快
开发环境：速度快，调试更友好
速度快（eval>inline>cheap>...）
eval-cheap-source-map
eval-source-map
调试更友好
source-map
cheap-module-source-map
cheap-source-map


--> eval-source-map / eval-cheap-module-source-map（开发环境 选用eval-source-map）


生产环境：源代码要不要隐蔽？调试要不要友好
内联会让体积变大，所以在生产环境不用内联
nosources-source-map 全部隐藏
hidden-source-map 只隐藏源代码，会提示构建后代码错误信息


--> source-map  / cheap-module-source-map （生产环境 选用source-map）


### oneof
提升构建速度，不用匹配多个loader
```javascript
  module:{
        rules:[
          //以下loader只会匹配一个
          //注意：不能有两个配置处理同一种类型的文件（例如都处理js的laoder）
            oneOf[         
              {//对命中的匹配的文件进行解析
                test:/\.css$/,
                //使用哪些loader
                use:[//执行顺序从右到左，从下到上
                    //创建style标签，将js的样式资源插入进去，添加到head中生效
                    'style-loader',
                    //将css文件变成commonjs模块加载js中，里面的内容是样式字符串
                    'css-loader'
                ],
            },{//对命中的匹配的文件进行解析
                test:/\.less$/,
                //使用哪些loader
                use:[//执行顺序从右到左，从下到上
                    //创建style标签，将js的样式资源插入进去，添加到head中生效
                    'style-loader',
                    //将css文件变成commonjs模块加载js中，里面的内容是样式字符串
                    'css-loader',
                    //将less转换成css
                    'less-loader',
                ],
            }],
        ],
    },
```
### 缓存
#### babel缓存
设置`cacheDirectory:true`
-->让第二次打包构建速度更快
```javascript
//webpack.config.js
{
                //对js做兼容性处理
                test:/\.js$/,
                exclude:/node_modules/,
                loader:'babel-loader',
                options:{
                    presets:[
                        '@babel/preset-env',
                        {
                            useBuiltIns:'usage',
                            corejs:{version:3},
                            targets:{
                                chrome:'60',
                                firefox:'50'
                            }
                        },
                    ],
                    //开启babel缓存
                    //第二次构建时，会读取之前的缓存
                    cacheDirectory:true,
}
```
#### 文件缓存

- hash：每次webpack构建时会生成一个唯一的hash值（不管文件有没有变化，只要构建了都会变）

问题：因为js和css同时使用一个hash值。如果重新打包，会导致所有缓存失效。（可能只改了一个文件）

- chunkhash：根据chunk生成的hash值。如果打包来源同一个chunk，那么hash值一样

问题：js和css的hash值还一样的
因为css是在js中被引入的，所以同属于一个chunk

- contenthash：根据文件的内容生成hash值。不同文件hash值一定不一样

--> 让代码上线运行缓存更好使用
```javascript
   output:{
        filename:'js/built.[contenthash:10].js',
        path:resolve(__dirname,'build')
    }  
```
```javascript
 plugins:[
        //...
        //css的提取
        new MiniCssExtractPlugin({
            //对输出的css进行重命名
            filename:'css/build.[contenthash:10].css'
        }),
    ],
```
### treeshaking
tree shaking 去除无用的代码
前提：1.必须使用es6模块化  2.开启production环境
作用：减少代码体积


在package.json中配置
“sideEffects”：false 所有代码都没有副作用 （都可以进行tree shaking）
问题：可能会把css/@babel/polyfill（副作用）文件干掉
“sideEffects”：["*.css","*.less"]


### code split 代码分割
```javascript
   /*
    1.可以将node_modules中的代码单独打包一个chunk最终输出
    2.自动分析多入口chunk中，有没有公共的文件。如果有会打包成单独一个chunk
    **/
    optimization:{
        splitChunks:{
            chunks:'all'
        },
    },
```


```javascript
/*
	通过js代码，让某个文件被单独打包成一个chunk
  import动态导入语法：能将某个文件单独打包
*/
import('./test').then(({mul})=>{
		console.log('文件被加载')
})
```
### 懒加载和预加载
懒加载：当文件需要使用时才加载
预加载 prefetch：会在使用之前，提前加载js文件
正常加载可以人为是并行加载（同一个时间加载多个文件）
预加载 prefetch：等其他资源加载完毕，浏览器空闲了，在偷偷加载资源
```javascript
//懒加载实例
//1.懒加载：点击的时候加载test
document.getElementById('btn').onclick=function(){
import(/*webpackChunkName:'test'*/'./test').then(({mul})=>{
		console.log(mul(4,5))
})
}
//2.预加载：在空闲时提前加载好test
document.getElementById('btn').onclick=function(){
import(/*webpackChunkName:'test',webpackPrefetch:true*/'./test').then(({mul})=>{
		console.log(mul(4,5))
})
}
```


多进程打包
```javascript
npm i thread-loader -D
```
```javascript
 {
                //对js做兼容性处理
                test:/\.js$/,
                exclude:/node_modules/,
                use:[
                    /*
                    开启多进程打包
                    进程启动大概为600ms，进程通信也有开销
                    只有工作消耗时间比较长，才需要多进程打包
                    */
                    {
                        loader:'thread-loader',
                        options:{
                            workers:2//2个进程
                        }
                    },
                    {
                        loader:'babel-loader',
                        options:{
                            //。。。
                        }
                    }
                ],
                
            },
```
### externals
让一些包不打进去，通过cdn的方式引入。指示哪些包不打包
```javascript
//webpack.config.js
mode:'prodution',
externals:{
//拒绝jQuery被打包进来
  jquery：'jQuery'
},
```
### dll
单独打包第三方库，并自动引入。避免每次重复打包第三方库
```javascript
//webpack.config.js
const {resolve} = require('path');
const HtmlWebpackPlugin =require('html-webpack-plugin')
const webpack =require('webpack')
const AddAssetHtmlWebpackPlugin=require('add-asset-html-webpack-plugin')
module.exports={
  entry:'./src/index.js',
  output:{
  	filename:'built.js',
    path:resolve(__dirname,'build')
  },
  plugins:[
  	new HtmlWebpackPlugin({
    	template:'./src/index.html'
    }),
    //告诉webpack哪些库不参与打包，同时使用时的名称也得变
    new webpack.DllReferencePlugin({
    	manifest:resolve(__dirname,'dll/manifest.json')
    }),
    //将某个文件打包输出去，并在html中自动引入该资源
    new AddAssetHtmlWebpackPlugin({
    	filepath:resolve(__dirname,'dll/jquery.js')
    })
  ],
  mode:'production'
}
```
```javascript
//webpack.dll.js  用于单独打包第三方库
/*
	使用dll技术，对某些库（第三方库：jquery、react、vue...）进行单独打包
  当你运行webpack时，默认查找webpack.config.js配置文件
  需求：需要运行webpack.dll.js文件
  -->webpack  --config webpack.dll.js
*/
const {resolve}=require('path')
const webpack = require('webpack')

module.exports={
  entry:{
    //最终打包生成的[name]-->jquery
    //['jquery']-->要打包的库是jquery
    jquery:['jquery']
  },
  output:{
  	filename:'[name].js',//打包后的文件名
    path:resolve(__dirname,'dll'),//打包后的文件路径
    library:'[name]_[hash]' //打包的库里面向外暴露出去的内容叫什么名字
  },
  plugins:[
  	//打包生成一个manifest.json文件 -->提供和jquery映射
    new webpack.DllPlugin({
    	name:'[name]_[hash]',//映射库的暴露的内容名称
      path:resolve(__dirname,'dll/manifest.json')//输出文件路径
    })
  ],
  mode:'production'
}
```
