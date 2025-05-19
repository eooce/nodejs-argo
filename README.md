## 赞助
* 感谢[VTEXS](https://console.vtexs.com/?affid=1548)提供赞助优质双isp vps。

# 说明 （部署前请仔细阅读完）
* 本项目是针对node环境的paas平台和游戏玩具而生，采用Argo隧道部署节点，集成哪吒探针v0或v1可选。
* node玩具平台只需上传index.js和package.json即可，paas平台需要docker部署的才上传Dockerfile。
* 如需是链接github部署，请先删除README.md说明文件。
* 不填写ARGO_DOMAIN和ARGO_AUTH两个变量即启用临时隧道，反之则使用固定隧道。
* 若遇到已获取到临时隧道但节点不通，说明域名被墙，重启即可
* 无需设置NEZHA_TLS,当哪吒端口为{443,8443,2096,2087,2083,2053}其中之一时，自动开启--tls。
* 右边的Releases中已适配FreeBSD，自行下载，类似的平台Serv00，CT8

* PaaS 平台设置的环境变量，index.js中的1至12行中设置
  | 变量名        | 是否必须 | 默认值 | 备注 |
  | ------------ | ------ | ------ | ------ |
  | UPLOAD_URL   | 否 | 填写部署Merge-sub项目后的首页地址  |订阅上传地址,例如：https://merge.serv00.net|
  | PROJECT_URL  | 否 | https://www.google.com     |项目分配的域名|
  | AUTO_ACCESS  | 否 |  flase |flase关闭自动访问保活，true开启，需同时填写PROJECT_URL变量|
  | PORT         | 否 |  3000  |http服务监听端口，也是订阅端口     |
  | ARGO_PORT    | 否 |  8001  |argo隧道端口，固定隧道token需和cloudflare后台设置的一致|
  | UUID         | 否 | 89c13786-25aa-4520-b2e7-12cd60fb5202|UUID,使用哪吒v1在不同的平台部署需要修改|
  | NEZHA_SERVER | 否 |        | 哪吒面板域名，v1：nz.aaa.com:8008  v0: nz.aaa.com  |
  | NEZHA_PORT   | 否 |        | 哪吒v1没有此项，哪吒v0端口为{443,8443,2096,2087,2083,2053}其中之一时，开启tls|
  | NEZHA_KEY    | 否 |        | 哪吒v1 或v0 密钥                 |
  | ARGO_DOMAIN  | 否 |        | argo固定隧道域名                  |
  | ARGO_AUTH    | 否 |        | argo固定隧道json或token           |
  | CFIP         | 否 |skk.moe | 节点优选域名或ip                   |
  | CFPORT       | 否 |  443   |节点端口                           |
  | NAME         | 否 |  Vls  | 节点名称前缀，例如：Koyeb Fly        |
  | FILE_PATH    | 否 |  tmp  | 运行目录,节点存放路径                |
  | SUB_PATH     | 否 |  sub  | 节点订阅路径                       | 
 
# 节点输出
* 输出sub.txt节点文件，默认存放路径为tmp
* 订阅：分配的域名/${SUB_PATH};例如https://www.google.com/${SUB_PATH}
* 非标端口订阅(游戏类):分配的域名:端口/${SUB_PATH},前缀是http，例如http://www.google.com:1234/${SUB_PATH}

# 其他
* 本项目已添加自动访问保活功能，仅支持不重启停机的平台，需在第2行中添加项目分配的域名。建议配合外部自动访问保活，保活项目地址：https://github.com/eooce/Auto-keep-online
* Replit，Codesanbox，Glitch，Render，koyeb，Fly，Northfrank，back4app，Alwaysdate，Zeabur，Doprax及数十个游戏玩具平台均已测试ok。
* Render及其他比较严格的容器平台，请使用docker image部署，Dockerfile地址：https://github.com/eooce/nodejs-argo-image

# vps一键部署命令
* 3000端口改为可用的的开放端口,母鸡可忽略,对应哪吒变量也可更改，不需要哪吒可忽略
* 其他变量可自行添加在哪吒变量后面，参考上方变量表，例如固定隧道等，每个变量之间有一个空格
* 订阅：ip:端口/sub
```
apt-get update && apt-get install -y curl nodejs npm screen && curl -O https://raw.githubusercontent.com/eooce/nodejs-argo/main/index.js && curl -O https://raw.githubusercontent.com/eooce/nodejs-argo/main/package.json && npm install && chmod +x index.js && NAME=Vls PORT=3000 NEZHA_SERVER=nz.abcd.cn NEZHA_PORT=5555 NEZHA_KEY=12345678 screen node index.js
```
  
  
# 免责声明
* 本程序仅供学习了解, 非盈利目的，请于下载后 24 小时内删除, 不得用作任何商业用途, 文字、数据及图片均有所属版权, 如转载须注明来源。
* 使用本程序必循遵守部署免责声明，使用本程序必循遵守部署服务器所在地、所在国家和用户所在国家的法律法规, 程序作者不对使用者任何不当行为负责。
