# 说明 （部署前请仔细阅读完）
* 本项目是针对node环境的paas平台和游戏玩具而生，采用Argo隧道部署节点，集成哪吒探针服务。
* node玩具平台只需上传index.js和package.json即可，paas平台需要docker部署的才上传Dockerfile。
* 如需是链接github部署，请先删除README.md说明文件，安全起见，已混淆主代码部分，无任何日志输出。
* 不填写ARGO_DOMAIN和ARGO_AUTH两个变量即启用临时隧道，反之则使用固定隧道。

* PaaS 平台设置的环境变量，index.js中的1至13行中设置
  | 变量名        | 是否必须 | 默认值 | 备注 |
  | ------------ | ------ | ------ | ------ |
  | URL          | 否 | https://www.google.com     | 项目域名    |
  | PORT         | 否 |  3000  |监听端口                         |
  | WEB_USERNAME | 否 |  admin |访问list和sub的用户名             |
  | WEB_PASSWORD | 否 |password| 访问list和sub的密码              |
  | UUID         | 否 | de04add9-5c68-8bab-870c-08cd5320df00     |
  | NEZHA_SERVER | 否 |        | 哪吒服务端域名，例如nz.aaa.com   |
  | NEZHA_PORT   | 否 |  5555  | 哪吒探针客户端口                 |
  | NEZHA_KEY    | 否 |        | 哪吒探针客户端专用 Key           | 
  | NEZHA_TLS    | 否 |    0   | 默认不启用，若启用请填1           |
  | ARGO_DOMAIN  | 否 |        | argo固定隧道域名                 |
  | ARGO_AUTH    | 否 |        | argo固定隧道json或token          |
  | CFIP         | 否 |skk.moe | 节点优选域名或ip                 |
  | NAME         | 否 |  ABCD  | 节点名称前缀，例如：Glitch，Replit| 

# 节点信息
* 本项目采用Argo隧道，输出list和sub文件，list文件会在2分钟后自动删除，域名/list或域名/sub查看节点信息。

# 其他
* 本项目已添加自动访问保活功能，仅支持不重启停机的平台，需在第2行中添加项目分配的域名。建议配合外部自动访问保活，保活项目地址：https://github.com/eoovve/Auto-keep-online
* Replit，Codesanbox，Glitch，koyeb，Fly，Northfrank，back4app，Alwaysdate，Zeabur，Doprax及数十个游戏玩具平台均已测试ok。
  
# 免责声明
* 本程序仅供学习了解, 非盈利目的，请于下载后 24 小时内删除, 不得用作任何商业用途, 文字、数据及图片均有所属版权, 如转载须注明来源。
* 使用本程序必循遵守部署免责声明，使用本程序必循遵守部署服务器所在地、所在国家和用户所在国家的法律法规, 程序作者不对使用者任何不当行为负责。
