# Railway Node.js 项目

这是一个功能丰富的 Node.js 应用，支持多种部署方式和在线配置管理。

## ✨ 主要功能

- 📦 **独立可执行文件** - 类似 JAR 包的使用方式，无需 Node.js 环境，下载即用
- 🔧 **Web 配置界面** - 通过 Web 页面在线修改环境变量
- 🐳 **Docker 部署** - 支持自动构建和发布 Docker 镜像
- 🚀 **哪吒监控** - 支持哪吒 v0 和 v1 版本
- 🌐 **Argo 隧道** - 支持固定隧道和临时隧道
- 📤 **节点上传** - 自动上传节点信息到订阅服务器
- 🔄 **自动发布** - 推送标签自动构建跨平台可执行文件

## 🚀 快速开始

### 方式一：使用独立可执行文件（推荐 - 类似 JAR 使用方式）

**无需安装 Node.js！** 下载对应平台的可执行文件即可直接运行：

#### Linux / macOS

```bash
# 1. 下载最新版本的可执行文件
# Linux
wget https://github.com/YOUR_USERNAME/railway/releases/latest/download/nodejs-argo-v1.0.0-linux-x64

# macOS
wget https://github.com/YOUR_USERNAME/railway/releases/latest/download/nodejs-argo-v1.0.0-macos-x64

# 2. 添加执行权限
chmod +x nodejs-argo-v1.0.0-linux-x64  # 或 macos-x64

# 3. 直接运行（类似 java -jar app.jar）
./nodejs-argo-v1.0.0-linux-x64

# 4. 后台运行
nohup ./nodejs-argo-v1.0.0-linux-x64 > app.log 2>&1 &

# 5. 设置环境变量运行
UUID=your-uuid NEZHA_SERVER=nz.example.com:8008 ./nodejs-argo-v1.0.0-linux-x64
```

#### Windows

```powershell
# 1. 下载 nodejs-argo-v1.0.0-windows-x64.exe

# 2. 双击运行，或在命令行中：
.\nodejs-argo-v1.0.0-windows-x64.exe

# 3. 设置环境变量运行
$env:UUID="your-uuid"
$env:NEZHA_SERVER="nz.example.com:8008"
.\nodejs-argo-v1.0.0-windows-x64.exe
```

**优势**：
- ✅ 无需安装 Node.js 环境
- ✅ 单文件部署，简单方便
- ✅ 跨平台支持（Linux、macOS、Windows）
- ✅ 类似 JAR 包的使用体验

### 方式二：使用 Docker

```bash
docker pull ghcr.io/YOUR_USERNAME/nodejs:latest

docker run -d -p 3000:3000 \
  -e UUID=your-uuid \
  -e NEZHA_SERVER=nz.example.com:8008 \
  -e NEZHA_KEY=your-key \
  -v $(pwd)/data:/tmp \
  ghcr.io/YOUR_USERNAME/nodejs:latest
```

### 方式三：从源码运行

```bash
# 克隆仓库
git clone https://github.com/YOUR_USERNAME/railway.git
cd railway

# 安装依赖
npm install

# 启动应用
npm start
```

## 🔧 Web 配置界面

部署成功后，你可以通过 Web 界面管理环境变量：

1. **访问配置页面**：`http://your-domain:3000/config`
2. **查看当前配置**：页面会显示所有当前的环境变量
3. **修改配置**：在表单中修改需要的环境变量
4. **保存配置**：点击"保存配置"按钮
5. **重启生效**：重启容器使新配置生效

### 配置界面截图

配置页面提供了友好的用户界面，包括：
- 📋 当前环境变量显示
- ✏️ 表单编辑功能
- 💾 一键保存配置
- 🔄 刷新配置功能

## 📝 环境变量说明

| 变量名 | 说明 | 默认值 | 必填 |
|--------|------|--------|------|
| `PORT` / `SERVER_PORT` | HTTP 服务端口 | 3000 | ❌ |
| `UPLOAD_URL` | 节点上传地址 | - | ❌ |
| `PROJECT_URL` | 项目 URL | - | ❌ |
| `AUTO_ACCESS` | 自动保活开关 | false | ❌ |
| `FILE_PATH` | 运行目录 | ./tmp | ❌ |
| `SUB_PATH` | 订阅路径 | sub | ❌ |
| `UUID` | 用户唯一标识 | 默认UUID | ✅ |
| `NEZHA_SERVER` | 哪吒服务器地址 | - | ❌ |
| `NEZHA_PORT` | 哪吒端口 (v0使用) | - | ❌ |
| `NEZHA_KEY` | 哪吒密钥 | - | ❌ |
| `ARGO_DOMAIN` | Argo 固定隧道域名 | - | ❌ |
| `ARGO_AUTH` | Argo 认证信息 | - | ❌ |
| `ARGO_PORT` | Argo 端口 | 8001 | ❌ |
| `CFIP` | CF 优选 IP/域名 | cdns.doon.eu.org | ❌ |
| `CFPORT` | CF 优选端口 | 443 | ❌ |
| `NAME` | 节点名称 | - | ❌ |

### 哪吒监控配置

#### 哪吒 v1 (推荐)
```bash
NEZHA_SERVER=nz.example.com:8008
NEZHA_KEY=your_client_secret
# 不需要设置 NEZHA_PORT
```

#### 哪吒 v0
```bash
NEZHA_SERVER=nz.example.com
NEZHA_PORT=5555
NEZHA_KEY=your_agent_key
```

### Argo 隧道配置

#### 固定隧道 (使用 Token)
```bash
ARGO_DOMAIN=your-domain.example.com
ARGO_AUTH=your_token_here
ARGO_PORT=8001
```

#### 固定隧道 (使用 JSON)
```bash
ARGO_DOMAIN=your-domain.example.com
ARGO_AUTH='{"AccountTag":"...","TunnelSecret":"...","TunnelID":"..."}'
ARGO_PORT=8001
```

#### 临时隧道
```bash
# 不设置 ARGO_DOMAIN 和 ARGO_AUTH，系统会自动生成临时隧道
```

## 🔄 使用 .env 文件配置

你可以在 `./tmp/.env` 文件中保存配置，应用会在启动时自动加载：

```env
UUID=9afd1229-b893-40c1-84dd-51e7ce204913
NEZHA_SERVER=nz.example.com:8008
NEZHA_KEY=your_key
ARGO_DOMAIN=your-domain.example.com
CFIP=cdns.doon.eu.org
CFPORT=443
NAME=MyNode
```

**注意**：通过 Web 配置界面保存的配置会自动写入此文件。

## 🐳 Docker 部署

### 构建镜像

```bash
docker build -t nodejs-argo .
```

### 使用 docker-compose

创建 `docker-compose.yml`：

```yaml
version: '3'
services:
  nodejs-argo:
    image: ghcr.io/YOUR_USERNAME/nodejs:latest
    ports:
      - "3000:3000"
    environment:
      - UUID=your-uuid
      - NEZHA_SERVER=nz.example.com:8008
      - NEZHA_KEY=your-key
      - NAME=MyNode
    volumes:
      - ./data:/tmp
    restart: unless-stopped
```

运行：
```bash
docker-compose up -d
```

### 使用 Volume 持久化配置

```bash
docker run -d \
  --name nodejs-argo \
  -p 3000:3000 \
  -v $(pwd)/data:/tmp \
  ghcr.io/YOUR_USERNAME/nodejs:latest
```

这样配置文件会保存在 `./data/.env` 中，容器重启后配置依然有效。

## 📦 API 端点

### GET /
主页，返回 "Hello world!"

### GET /config
Web 配置界面

### GET /api/config
获取当前环境变量配置（JSON 格式）

```bash
curl http://localhost:3000/api/config
```

### POST /api/config
保存环境变量配置

```bash
curl -X POST http://localhost:3000/api/config \
  -H "Content-Type: application/json" \
  -d '{
    "UUID": "your-uuid",
    "NEZHA_SERVER": "nz.example.com:8008",
    "NEZHA_KEY": "your-key"
  }'
```

### GET /[SUB_PATH]
获取订阅信息（默认路径：/sub）

```bash
curl http://localhost:3000/sub
```

## 🔨 开发

### 安装依赖

```bash
npm install
```

### 本地运行

```bash
npm start
```

或

```bash
npm run dev
```

### 项目结构

```
.
├── index.js                 # 主程序文件
├── package.json            # 项目配置
├── Dockerfile             # Docker 构建文件
├── .github/
│   └── workflows/
│       ├── build-docker-image.yml  # Docker 镜像构建工作流
│       └── release.yml             # Release 发布工作流
└── README.md              # 项目文档
```

## 📦 发布 Release

### 自动发布

推送标签时自动创建 Release（会自动构建独立可执行文件）：

```bash
git tag v1.0.0
git push origin v1.0.0
```

### 手动触发

在 GitHub Actions 页面手动触发 "Create Release" 工作流。

### Release 资产说明

每个 Release 自动构建并包含以下资产：

#### 🎯 独立可执行文件（推荐）
**类似 JAR 包的使用方式，无需 Node.js 环境**

- `nodejs-argo-v1.0.0-linux-x64` - Linux 64位可执行文件（约 50-70MB）
- `nodejs-argo-v1.0.0-macos-x64` - macOS 64位可执行文件（约 50-70MB）
- `nodejs-argo-v1.0.0-windows-x64.exe` - Windows 64位可执行文件（约 50-70MB）

这些文件包含完整的 Node.js 运行时和应用代码，下载后可直接运行：

```bash
# Linux/macOS
chmod +x nodejs-argo-v1.0.0-linux-x64
./nodejs-argo-v1.0.0-linux-x64

# Windows
nodejs-argo-v1.0.0-windows-x64.exe
```

#### 📦 源码包
- `nodejs-argo-v1.0.0-source.tar.gz` - 源码压缩包（tar.gz）
- `nodejs-argo-v1.0.0-source.zip` - 源码压缩包（zip）

#### 🔐 校验文件
- `SHA256SUMS.txt` - 所有可执行文件的 SHA256 校验和

#### 🐳 其他资源
- Docker 镜像：`ghcr.io/YOUR_USERNAME/nodejs:latest`
- 详细的安装和使用说明

### 构建原理

独立可执行文件使用 [pkg](https://github.com/vercel/pkg) 工具构建，它将 Node.js 应用和运行时打包成单个二进制文件。

**本地构建**：
```bash
# 安装依赖
npm install

# 构建所有平台的可执行文件
npm run build:all

# 构建特定平台
npm run build
```

构建后的文件位于 `dist/` 目录。

## 🛠️ 故障排除

### 容器无法启动

1. 检查端口是否被占用
2. 确认环境变量配置正确
3. 查看容器日志：`docker logs <container-id>`

### Web 配置界面无法访问

1. 确认容器正在运行
2. 检查端口映射是否正确
3. 确认防火墙设置

### 配置修改不生效

1. 确认配置已保存成功
2. 重启容器使配置生效
3. 检查 `.env` 文件是否正确生成

### 哪吒监控无法连接

1. 确认服务器地址和端口正确
2. 检查密钥是否正确
3. 确认使用的是正确的哪吒版本配置

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [哪吒监控](https://github.com/naiba/nezha)
- [Cloudflare Argo](https://www.cloudflare.com/products/tunnel/)
- [Docker](https://www.docker.com/)

## ⭐ Star History

如果这个项目对你有帮助，请给它一个 Star！
