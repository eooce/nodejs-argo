# nodejs-argo说明

* PaaS 平台设置的环境变量
  | 变量名        | 是否必须 | 默认值 | 备注 |
  | ------------ | ------ | ------ | ------ |
  | URL          | 否 | https://www.google.com     | 项目域名    |
  | PORT         | 否 |  3000  |                                |
  | UUID         | 否 | de04add9-5c68-6bab-950c-08cd5320df37     |
  | NEZHA_SERVER | 否 |        | 域名+端口，例如nz.aaa.com:5555   |
  | NEZHA_PORT   | 否 |  5555  | 哪吒探针客户端口                 |
  | NEZHA_KEY    | 否 |        | 哪吒探针客户端专用 Key           | 
  | NEZHA_TLS    | 否 |    0   | 默认不启用，若启用请填1           |
  | ARGO_DOMAIN  | 否 |        | argo固定隧道域名                 |
  | ARGO_AUTH    | 否 |        | argo固定隧道json或token          |
  | CFIP         | 否 |skk.moe | 节点优选域名或ip                 |
  | NAME         | 否 |  ABCD  | 节点名称前缀，例如：Glitch，Replit| 
        
