# 项目说明

基于 ng-alain 框架搭建的运维管理平台前端

对应的后端项目地址：[devopsapi](https://github.com/marbleqi/devopsapi)

注：项目全程开源，记录个人的学习过程，督促自己学习进步。并欢迎大家共同交流进步。

## 演示环境说明

[前端演示环境](https://admin.demo.marbleqi.top)

[后端演示环境](https://api.demo.marbleqi.top)

演示环境超管账号：root，密码：root

## 后端地址配置说明

为避免项目中的后端地址硬代码，所以将后端地址制作了配置文件api.json，并保存在src/assets/config目录下。

具体格式可参照api.demo.json文件，在仓库中，该文件api.json被忽略，开发过程中，请自行配置该文件。

部署到生产环境下时，可以使用挂载文件的方式替换，或者数据卷的模式替换，从而实现自定义后端地址。

## 项目其他文档

[开发环境准备](docs/开发环境准备.md)