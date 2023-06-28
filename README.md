# po
小程序技术，模仿微信小程序


## 主要特点
1. view 和 js 编译成独立两套
2. view 可运行在浏览器，electron 的webview等
3. js 运行在node下
4. view 和 js 通过rpc进行通信


### 涉及知识点
1. 虚拟DOM
2. 编译相关知识, ast/code-gen等等
3. 等等...


### 浏览器实例
[img](assets/browser.simple.png)

在浏览器中运行，webview 运行在浏览器中,js部分运行在node中