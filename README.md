# sass 前端-微吼直播领域层工程

> 项目说明：
>
> 1. 该项目是 SaaS 直播前端 platform 工程的领域层工程。
> 2. 该项目内容是对 SaaS 直播的各功能模块的业务封装。
> 3. 该项目使用 rollup 构建，输出 jssdk。  
>    gitlab 地址： https://gitlabnew.vhall.com/csd/fe/middle-domain

---

### 主要技术栈

- es6+
- rollup

---

### 项目目录结构说明

```
project
│
├── docs # 文档相关目录
│    ├────...
│    └────...
│
├── script  # 项目编译工具
│    ├────plugins
│    │    └────... # 自定义rollup插件
│    ├────btool.js # 项目编译辅助工具
│    ├────build.js # 实际编译构建脚本
│    └────update-version.js  # 更新版本脚本
│
├── src
│    ├────domain #各服务模块封装
│    │    ├────...
│    │    ├────...
│    │    └────...
│    │
│    ├────request #调用服务端api接口请求
│    │    ├────...
│    │    ├────...
│    │    └────...
│    │
│    ├────sdk #domain sdk class
│    │    ├────lib
│    │    │    └────pass-sdk  # pass sdk资源配置
│    │    └────index.js #sdk初始化入口
│    │
│    ├────utils # 工具函数
│    │    ├────...
│    │    ├────...
│    │    └────...
│    │
│    └────index.js #sdk导出
│    │
├── .babelrc #babel文件配置
├── .editorconifg #编辑器规范配置
├── .eslintignore #eslint忽略配置
├── .eslintrc.js #eslint规则配置
├── .gitignore #忽略文件
├── .prettierignore #代码格式化忽略配置
├── .commitlint.config.js # 提交命令规范检查配置
├── package.json #项目依赖配置
├── prettier.config.js #代码格式化配置
├── README.md #项目的说明文档，markdown 格式
├── rollup.config.base.js # rollup 生产和测试环境公用配置文件
├── rollup.config.js # rollup 开发环境配置文件
├── rollup.config.prod.js # rollup 生产环境配置文件
├── rollup.config.test.js # rollup 测试环境配置文件
└── yarn.lock 项目依赖锁文件

```

---

&nbsp;

## 命令

1. 安装依赖

```shell
  yarn install
```

2. 本地开发运行

```shell

## 项目启动
npm run dev
#开启后10001端口访问，platform项目可连本地domain开发调试

## ...

```

3. 编译构建

```shell

## jenkins持续集成（运维支持）
node scripts/build.js build --env=${env} --cover=${cover}
> 其中：${env} 表示构建环境，可选production:生产环境， test:测试环境
       ${cover} 表示是否覆盖当前存在的版本，true:是，false:否
# 运维自动化构建，编译后会拷贝dist/cloud 和dist/sourcemap 两个目录下的文件到oss指定位置。


# 其它
yarn build:test  #测试环境执行不覆盖命令构建
yarn build:prod  #生产环境执行不覆盖命令构建
yarn build:rollup  #生产环境执行不限制命令构建

```

4. 格式化代码

```shell

## 格式化代码
npm run format

```

&emsp; 更多命令参考 package.json 中的 scripts 配置

---

### 打包说明

1. 暂时只支持了用 rollup 打包原生 js，后续增加对第三方库等的支持以及按规则读取目录下的文件名自动生成配置等

> **注意：开发通用 api 的时候最好取个有辨识度，言简意赅的别名，并且最好显式的命名 export**

### 使用说明

1. 打包之后会在 dist 目录下生成 ${version}/middle-domain.js、${version}/middle-domain.js.map 文件。
2. 在实际工程里使用：
   (1) cdn 外链: https://cnstatic01.e.vhall.com/common-static/middle/middle-domain/1.3.17/middle-domain.js
   (2) vue.config.js 中配置

   ```
   externals: {
       'middle-domain': 'middleDomain',
     }
   ```

   (3) 初始化示例

   ```js
   import { Domain } from 'middle-domain';
   new Domain({
     plugins: ['chat', 'player', 'doc', 'interaction', 'questionnaire'],
     requestHeaders: {
       token: localStorage.getItem('token') || ''
     },
     requestBody: {
       live_token: liveT || live_token
     },
     initRoom: {
       webinar_id: id, //活动id
       clientType: 'send', //客户端类型
       nickname,
       email,
       check_online: 0 // 不检查主持人是否在房间
     }
   });
   ```

   (4) 使用 server 示例

   ```js
   import { useRoomBaseServer } from 'middle-domain';
   const roomBaseServer = useRoomBaseServer();

   roomBaseServer.getInavToolStatus();
   roomBaseServer.getCustomRoleName();
   ```
