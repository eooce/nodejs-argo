# Railway Node.js Argo - Java Spring Boot 版本

这是原 Node.js 项目的 Java Spring Boot 实现版本，提供完全相同的功能，可以构建为标准的 JAR 文件运行。

## ✨ 主要功能

- 📦 **标准 JAR 包** - 使用 `java -jar` 命令运行，完全的 Java 生态体验
- 🔧 **Web 配置界面** - 通过 Web 页面在线修改环境变量
- 🚀 **Spring Boot** - 基于 Spring Boot 3.x 框架，性能优异
- ☕ **Java 17+** - 使用现代 Java 特性
- 🔄 **自动发布** - 推送标签自动构建和发布 JAR 文件

## 🚀 快速开始

### 方式一：使用 JAR 文件（推荐）

**前提条件**: 需要安装 Java 17 或更高版本

#### 下载并运行

```bash
# 下载最新版本的 JAR 文件
wget https://github.com/YOUR_USERNAME/railway/releases/latest/download/nodejs-argo-1.0.0.jar

# 基本运行
java -jar nodejs-argo-1.0.0.jar

# 指定 JVM 参数（类似容器启动方式）
java -Xms128M -XX:MaxRAMPercentage=85.0 -jar nodejs-argo-1.0.0.jar

# 使用环境变量指定端口和配置
SERVER_PORT=8080 UUID=your-uuid NEZHA_SERVER=nz.example.com:8008 java -jar nodejs-argo-1.0.0.jar

# 后台运行
nohup java -Xms128M -XX:MaxRAMPercentage=85.0 -jar nodejs-argo-1.0.0.jar > app.log 2>&1 &
```

#### 命令行参数说明

| 参数 | 简写 | 说明 |
|------|------|------|
| `--help` | `-h` | 显示帮助信息 |

#### JVM 参数说明

| 参数 | 说明 | 示例 |
|------|------|------|
| `-Xms` | 设置初始堆内存 | `-Xms128M` |
| `-Xmx` | 设置最大堆内存 | `-Xmx512M` |
| `-XX:MaxRAMPercentage` | 设置最大使用 RAM 的百分比 | `-XX:MaxRAMPercentage=85.0` |

**端口配置优先级**（从高到低）：
1. 环境变量（`SERVER_PORT=8080` 或 `PORT=8080`）
2. .env 文件配置
3. 默认值（3000）

**注意**：端口无法通过命令行参数指定，只能通过环境变量或 .env 文件配置。

### 方式二：从源码构建

#### 前提条件
- Java 17 或更高版本
- Maven 3.6 或更高版本

```bash
# 克隆仓库
git clone https://github.com/YOUR_USERNAME/railway.git
cd railway/java-version

# 使用 Maven 构建
mvn clean package

# 运行构建的 JAR
java -jar target/nodejs-argo-1.0.0.jar
```

## 🔧 Web 配置界面

部署成功后，你可以通过 Web 界面管理环境变量：

1. **访问配置页面**：`http://your-domain:3000/config`
2. **查看当前配置**：页面会显示所有当前的环境变量
3. **修改配置**：在表单中修改需要的环境变量
4. **保存配置**：点击"保存配置"按钮
5. **重启生效**：重启应用使新配置生效

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

## 🔨 开发

### 构建项目

```bash
# 清理并构建
mvn clean package

# 跳过测试构建
mvn clean package -DskipTests

# 运行
java -jar target/nodejs-argo-1.0.0.jar
```

### 本地开发

```bash
# 使用 Maven 直接运行
mvn spring-boot:run

# 指定端口
mvn spring-boot:run -Dspring-boot.run.arguments=--port=8080
```

### 项目结构

```
java-version/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/
│       │       └── railway/
│       │           └── app/
│       │               ├── Application.java          # 主应用类
│       │               ├── config/
│       │               │   └── AppConfig.java        # 配置管理
│       │               ├── controller/
│       │               │   └── ConfigController.java # 配置控制器
│       │               └── service/
│       │                   └── ServerService.java    # 服务类
│       └── resources/
│           └── application.properties                # Spring Boot 配置
├── pom.xml                                           # Maven 配置
└── README.md                                         # 项目文档
```

## 📦 发布 Release

### 自动发布

推送标签时自动创建 Release（会自动构建 JAR 文件）：

```bash
git tag v1.0.0-java
git push origin v1.0.0-java
```

### 手动构建

```bash
# 构建 JAR 文件
mvn clean package

# JAR 文件位于
ls -lh target/nodejs-argo-1.0.0.jar
```

## 🛠️ 故障排除

### 应用无法启动

1. 检查 Java 版本是否为 17 或更高
2. 确认端口是否被占用
3. 查看日志输出：`java -jar nodejs-argo-1.0.0.jar`

### Web 配置界面无法访问

1. 确认应用正在运行
2. 检查端口配置是否正确
3. 确认防火墙设置

### 配置修改不生效

1. 确认配置已保存成功
2. 重启应用使配置生效
3. 检查 `.env` 文件是否正确生成

## 🔄 与 Node.js 版本的区别

| 特性 | Node.js 版本 | Java 版本 |
|------|-------------|-----------|
| 运行环境 | 需要 Node.js | 需要 Java 17+ |
| 包格式 | 独立可执行文件 (pkg) | JAR 文件 |
| 运行命令 | `./nodejs-argo` | `java -jar nodejs-argo.jar` |
| 内存管理 | Node.js 自动管理 | JVM 参数控制（-Xms, -Xmx等） |
| Docker 支持 | ✅ 有 Docker 镜像 | ❌ 仅提供 JAR 文件 |
| 配置方式 | 完全相同 | 完全相同 |
| Web 界面 | 完全相同 | 完全相同 |

**推荐使用场景**：
- **Node.js 版本**：需要 Docker 部署，或者不想安装 Java 环境
- **Java 版本**：已有 Java 环境，或者需要精细的 JVM 参数调优

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [Spring Boot](https://spring.io/projects/spring-boot)
- [Maven](https://maven.apache.org/)
- [原 Node.js 版本](../README.md)（包含 Docker 镜像发布）

## 💡 说明

此 Java 版本专注于提供标准 JAR 文件发布。如果需要 Docker 部署，请使用原 Node.js 版本，它包含完整的 Docker 支持和自动构建工作流。
