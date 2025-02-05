#### node 建议版本

npm i 使用 14.12.0 版本
npm run dev node 14.20.1
线上 NodeJS 版本为 node 14.20.1 npm 版本是 6.14.17

#### 依赖安装

> 可先设置国内淘宝镜像提升下载速度
> npm config set registry = https://registry.npmmirror.com
> npm install

#### 多语言项目代码拉取

> 当前项目根目录

```
cd static
git clone ${多语言仓库地址} locales
```

#### 项目启动

npm run dev

> Ps: 项目启动时候可能遇到内存超出问题，可以添加 .nuxtignore 忽略部分项目目录

```
pages/*
!pages/_lang/
!pages/_lang/my_account/
!pages/my_account/

/pages/*.vue
/pages/**/*.vue

!/pages/workspace/enhance.vue
!/pages/_lang/workspace/enhance.vue
```

#### 注意事项

##### 分支一致

- 开发时候保证 当前项目的分支和 static 目录下面多语言项目分支一致

#### 项目介绍

##### 技术栈

- vue 2.x
- nuxtjs 2.12.0 https://nuxtjs.org/
