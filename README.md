<div align="center">

# nodejs-argo隧道代理

[![npm version](https://img.shields.io/npm/v/nodejs-argo.svg)](https://www.npmjs.com/package/nodejs-argo)
[![npm downloads](https://img.shields.io/npm/dm/nodejs-argo.svg)](https://www.npmjs.com/package/nodejs-argo)
[![License](https://img.shields.io/npm/l/nodejs-argo.svg)](https://github.com/eooce/nodejs-argo/blob/main/LICENSE)

nodejs-argo是一个强大的Argo隧道部署工具，专为PaaS平台和游戏玩具平台设计。它支持多种代理协议（VLESS、VMess、Trojan等），并集成了哪吒探针功能。

---

Telegram交流反馈群组：https://t.me/eooceu
</div>

## 郑重声明
* 本项目自2025年10月29日15时45分起,已更改开源协议为GPL 3.0,并包含以下特定要求
* 此项目仅限个人使用，禁止用于商业行为(包括但不限于：youtube,bilibili,tiktok,facebook..等等)
* 禁止新建项目将代码复制到自己仓库中用做商业行为
* 请遵守当地法律法规,禁止滥用做公共代理行为
* 如有违反以上条款者将追究法律责任

## 说明 （部署前请仔细阅读）

* 本项目是针对node环境的paas平台和游戏玩具而生，采用Argo隧道部署节点，集成哪吒探针v0或v1可选。
* node玩具平台只需上传index.js和package.json即可，paas平台需要docker部署的才上传Dockerfile。
* 不填写ARGO_DOMAIN和ARGO_AUTH两个变量即启用临时隧道，反之则使用固定隧道。
* 哪吒v0/v1可选,当哪吒端口为{443,8443,2096,2087,2083,2053}其中之一时，自动开启tls。

## 📋 环境变量

| 变量名 | 是否必须 | 默认值 | 说明 |
|--------|----------|--------|------|
| UPLOAD_URL | 否 | - | 订阅上传地址 |
| PROJECT_URL | 否 | https://www.google.com | 项目分配的域名 |
| AUTO_ACCESS | 否 | false | 是否开启自动访问保活 |
| PORT | 否 | 3000 | HTTP服务监听端口 |
| ARGO_PORT | 否 | 8001 | Argo隧道端口 |
| UUID | 否 | 89c13786-25aa-4520-b2e7-12cd60fb5202 | 用户UUID |
| NEZHA_SERVER | 否 | - | 哪吒面板域名 |
| NEZHA_PORT | 否 | - | 哪吒端口 |
| NEZHA_KEY | 否 | - | 哪吒密钥 |
| ARGO_DOMAIN | 否 | - | Argo固定隧道域名 |
| ARGO_AUTH | 否 | - | Argo固定隧道密钥 |
| CFIP | 否 | www.visa.com.tw | 节点优选域名或IP |
| CFPORT | 否 | 443 | 节点端口 |
| NAME | 否 | Vls | 节点名称前缀 |
| FILE_PATH | 否 | ./tmp | 运行目录 |
| SUB_PATH | 否 | sub | 订阅路径 |

## 🌐 订阅地址

- 标准端口：`https://your-domain.com/sub`
- 非标端口：`http://your-domain.com:port/sub`

---

