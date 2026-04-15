FROM alpine:latest
WORKDIR /app

# 1. 安装基础工具
RUN apk add --no-cache ca-certificates openssl wget curl unzip bash gcompat iproute2 coreutils python3

# 2. 下载二进制文件 (根据架构自动选择)
RUN arch=$(uname -m); \
    if [ "$arch" = "x86_64" ]; then export ARCH="amd64"; else export ARCH="arm64"; fi; \
    wget -O hysteria https://github.com/apernet/hysteria/releases/latest/download/hysteria-linux-$ARCH && chmod +x hysteria; \
    wget -O nz-agent.zip https://github.com/nezhahq/agent/releases/latest/download/nezha-agent_linux_$ARCH.zip && unzip nz-agent.zip && chmod +x nezha-agent; \
    wget -O cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-$ARCH && chmod +x cloudflared

# 3. 直接写入启动脚本 (使用 EOF 避免转义错误)
RUN cat <<'EOF' > /app/entrypoint.sh
#!/bin/bash
# 启动伪装 Web
mkdir -p /app/web && echo "Service Running" > /app/web/index.html
nohup python3 -m http.server 3000 --directory /app/web >/dev/null 2>&1 &

# 启动隧道
nohup /app/cloudflared tunnel --url http://localhost:3000 > /app/argo.log 2>&1 &

# 获取哪吒配置并启动
NZ_SERVER=${NEZHA_SERVER:-"nezha.9527x.eu.cc:8008"}
NZ_KEY=${NEZHA_KEY:-"mD3q9FowVHp94q0wzg0ha7AUoP8PuXjU"}
sleep 10
nohup /app/nezha-agent -s ${NZ_SERVER} -p ${NZ_KEY} --report-delay 4 --skip-conn --skip-procs >/dev/null 2>&1 &

# 生成 Hy2 配置
cat <<EOT > /app/config.yaml
listen: :443
tls:
  cert: /app/cert.crt
  key: /app/cert.key
auth:
  type: password
  password: ${HY2_PASSWORD:-"claw123456"}
fastOpen: true
bandwidth:
  up: 1000 mbps
  down: 3000 mbps
EOT

openssl req -x509 -nodes -newkey rsa:2048 -keyout /app/cert.key -out /app/cert.crt -subj "/CN=www.bing.com" -days 3650
exec /app/hysteria server -c /app/config.yaml
EOF

RUN chmod +x /app/entrypoint.sh

EXPOSE 443/udp
EXPOSE 443/tcp
EXPOSE 3000

ENTRYPOINT ["/bin/bash", "/app/entrypoint.sh"]
