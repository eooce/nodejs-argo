# nodejs-argo说明
本项目是针对node环境的paas平台或游戏玩具而生，pass平台需要docker部署的才上传Dockerfile,其他玩具平台只需上传index.js和package.json即可。
如果是链接github部署，请先删除REDEME.md说明文件，安全起见，已混淆主代码部分，变量部分自行根据需要修改。

* PaaS 平台设置的环境变量
  | 变量名        | 是否必须 | 默认值 | 备注 |
  | ------------ | ------ | ------ | ------ |
  | URL          | 否 | https://www.google.com     | 项目域名    |
  | PORT         | 否 |  3000  |监听端口，根据不同平台要求设置     |
  | WEB_USERNAME | 否 |  admin |访问list和sub的用户名             |
  | WEB_PASSWORD | 否 |password| 访问list和sub的密码              |
  | UUID         | 否 | de04add9-5c68-8bab-870c-08cd5320df00     |
  | NEZHA_SERVER | 否 |        | 域名+端口，例如nz.aaa.com:5555   |
  | NEZHA_PORT   | 否 |  5555  | 哪吒探针客户端口                 |
  | NEZHA_KEY    | 否 |        | 哪吒探针客户端专用 Key           | 
  | NEZHA_TLS    | 否 |    0   | 默认不启用，若启用请填1           |
  | ARGO_DOMAIN  | 否 |        | argo固定隧道域名                 |
  | ARGO_AUTH    | 否 |        | argo固定隧道json或token          |
  | CFIP         | 否 |skk.moe | 节点优选域名或ip                 |
  | NAME         | 否 |  ABCD  | 节点名称前缀，例如：Glitch，Replit| 
        
