# sass前端-微吼直播领域层工程

> 项目说明：  
> 1. 该项目是xxx
> 2. 项目技术框架采用 xxx
> 3. 该项目的开发xxx
> 下载地址： https://gitlab.vhall.com/web/fe-sass-vhall-domain.git

------------------
### 主要技术栈
  - vue 2.6.10 基于vue2.x前端框架 (xxxx)
  - @vue/cli 4.5.x  脚手架 (xxxx)
  
------------------
### 项目目录结构说明

### 打包说明
1. 暂时只支持了用rollup打包原生js，后续增加对第三方库等的支持以及按规则读取目录下的文件名自动生成配置等

> **注意：开发通用api的时候最好取个有辨识度，言简意赅的别名，并且最好显式的命名export**

### 使用说明

 1. 打包之后会在dist目录下生成vhall-saas-domain文件夹，这个里面就是主要的文件,
    在实际工程里若要按需加载（形如`import {xxx} from "vhall-saas-domain"`）,可参照下面的简单指引
 2. 首先需要安装babel-plugin-component插件，命令行安装：npm i babel-plugin-component -D
 3. 然后需要在配置好babel.config.js或者.babelrc文件中，设置好如下代码，更多详细配置可以参照插件的官方文档
```
"plugins": [
  [
  "component",{
    "libraryName": "vhall-saas-domain",
      // "root": "index.js",
      "style": false,
      "camel2Dash": false
  },
  'vhall-saas-domain'
  ]
]
```
 4. 然后在项目里就可以按需或者整体引入使用了(按需引入的话工程打包会进行treeShaking之后只会有引入的模块代码)
 5. 也可以整体作为一个对象引入，代码形如`import xx from "vhall-saas-domain" `