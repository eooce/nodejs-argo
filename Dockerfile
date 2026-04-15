FROM alpine:latest
WORKDIR /app

# 1. 安装基础工具
RUN apk add --no-cache ca-certificates openssl wget curl unzip bash gcompat iproute2 coreutils python3

# 2. 下载二进制文件
RUN arch=$(uname -m); \
    if [ "$arch" = "x86_64" ]; then export ARCH="amd64"; else export ARCH="arm64"; fi; \
    wget -O hysteria https://github.com/apernet/hysteria/releases/latest/download/hysteria-linux-$ARCH && chmod +x hysteria; \
    wget -O nz-agent.zip https://github.com/nezhahq/agent/releases/latest/download/nezha-agent_linux_$ARCH.zip && unzip nz-agent.zip && chmod +x nezha-agent; \
    wget -O cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-$ARCH && chmod +x cloudflared

# 3. 写入增强版启动脚本
RUN cat <<'EOF' > /app/entrypoint.sh
#!/bin/bash
# 启动伪装 Web 激活网络
mkdir -p /app/web && echo "Service Running" > /app/web/index.html
nohup python3 -m http.server 3000 --directory /app/web >/dev/null 2>&1 &

# 启动隧道
nohup /app/cloudflared tunnel --url http://localhost:3000 > /app/argo.log 2>&1 &

# --- 哪吒增强启动逻辑 ---
NZ_SERVER=${NEZHA_SERVER:-"35.209.233.178:8008"}
NZ_KEY=${NEZHA_KEY:-"mD3q9FowVHp94q0wzg0ha7AUoP8PuXjU"}

# 自动判断 TLS (参考你给的代码逻辑)
PORT=$(echo $NZ_SERVER | cut -d: -f2)
TLS="false"
if [[ "$PORT" == "443" || "$PORT" == "8443" || "$PORT" == "2096" || "$PORT" == "2053" ]]; then
    TLS="true"
fi

# 生成哪吒专属配置文件
cat <<EOT > /app/nz_config.yaml
client_secret: ${NZ_KEY}
debug: false
disable_auto_update: true
disable_command_execute: false
disable_nat: false
insecure_tls: true
report_delay: 4
server: ${NZ_SERVER}
skip_connection_count: true
skip_procs_count: true
tls: ${TLS}
uuid: $(cat /proc/sys/kernel/random/uuid)
EOT

sleep 10
# 启动哪吒 (使用配置文件模式，更稳)
nohup /app/nezha-agent -c /app/nz_config.yaml >/dev/null 2>&1 &
# ------------------------

# 生成 Hy2 高性能直连配置
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
