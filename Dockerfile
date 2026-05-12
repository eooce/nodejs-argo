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
set +e

echo "========== container boot =========="
echo "date=$(date -Is)"
echo "uname=$(uname -a)"
echo "env SERVER_PORT=${SERVER_PORT:-} PORT=${PORT:-} NEZHA_SERVER=${NEZHA_SERVER:-} NEZHA_TLS=${NEZHA_TLS:-} HY2_PORT=${HY2_PORT:-}"
echo "binaries:"
ls -lh /app/hysteria /app/nezha-agent /app/cloudflared || true

# 启动伪装 Web 激活网络
mkdir -p /app/web && echo "Service Running" > /app/web/index.html
nohup python3 -m http.server 3000 --directory /app/web >/app/web.log 2>&1 &

# 启动隧道
nohup /app/cloudflared tunnel --url http://localhost:3000 > /app/argo.log 2>&1 &

# --- 哪吒增强启动逻辑 ---
# 默认使用已验证可访问的哪吒面板域名；也可在 Pterodactyl 环境变量里覆盖 NEZHA_SERVER/NEZHA_KEY/NEZHA_TLS。
NZ_SERVER=${NEZHA_SERVER:-"nezha.9527x.eu.cc:8008"}
NZ_KEY=${NEZHA_KEY:-"mD3q9FowVHp94q0wzg0ha7AUoP8PuXjU"}

# 自动判断 TLS，允许 NEZHA_TLS 显式覆盖。8008 这个面板端口是 HTTP/gRPC 非 TLS。
NZ_PORT=$(echo $NZ_SERVER | awk -F: '{print $NF}')
TLS="false"
if [[ "$NZ_PORT" == "443" || "$NZ_PORT" == "8443" || "$NZ_PORT" == "2096" || "$NZ_PORT" == "2053" ]]; then
    TLS="true"
fi
if [[ -n "$NEZHA_TLS" ]]; then
    TLS="$NEZHA_TLS"
fi

# 生成哪吒专属配置文件
cat <<EOT > /app/nz_config.yaml
client_secret: ${NZ_KEY}
debug: true
disable_auto_update: true
disable_command_execute: false
disable_force_update: true
disable_nat: false
disable_send_query: false
gpu: false
insecure_tls: true
ip_report_period: 1800
report_delay: 4
server: ${NZ_SERVER}
skip_connection_count: true
skip_procs_count: true
temperature: false
tls: ${TLS}
use_gitee_to_upgrade: false
use_ipv6_country_code: false
uuid: ${NEZHA_UUID:-$(cat /proc/sys/kernel/random/uuid)}
EOT

sleep 5
# 启动哪吒 (使用配置文件模式，更稳)。日志写到文件并回显，方便在 Pterodactyl Console 判断是否鉴权/连通失败。
echo "[NEZHA] server=${NZ_SERVER} tls=${TLS}"
/app/nezha-agent -c /app/nz_config.yaml > /app/nezha.log 2>&1 &
NZ_PID=$!
sleep 5
if kill -0 "$NZ_PID" 2>/dev/null; then
  echo "[NEZHA] running pid=${NZ_PID}"
else
  echo "[NEZHA] exited early"
fi
tail -n 80 /app/nezha.log || true
# ------------------------

# 生成 Hy2 高性能直连配置
# Pterodactyl/NAT 面板会通过 SERVER_PORT 分配外部端口；必须监听它，否则面板显示的 66.x.x.x:端口 会不通。
HY2_PORT=${HY2_PORT:-${SERVER_PORT:-${PORT:-443}}}
echo "[HY2] listen udp/tcp :${HY2_PORT}"
cat <<EOT > /app/config.yaml
listen: :${HY2_PORT}
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

echo "[CHECK] listening before hy2:"
ss -lntup || true

echo "[HY2] starting..."
/app/hysteria server -c /app/config.yaml > /app/hy2.log 2>&1 &
HY2_PID=$!
sleep 5
if kill -0 "$HY2_PID" 2>/dev/null; then
  echo "[HY2] running pid=${HY2_PID}"
else
  echo "[HY2] exited early"
fi
tail -n 120 /app/hy2.log || true

echo "[CHECK] listening after start:"
ss -lntup || true

echo "[KEEPALIVE] container stays alive for debugging"
while true; do
  sleep 60
  if ! kill -0 "$NZ_PID" 2>/dev/null; then echo "[NEZHA] not running"; tail -n 60 /app/nezha.log || true; fi
  if ! kill -0 "$HY2_PID" 2>/dev/null; then echo "[HY2] not running"; tail -n 80 /app/hy2.log || true; fi
done
EOF

RUN chmod +x /app/entrypoint.sh

EXPOSE 443/udp
EXPOSE 443/tcp
EXPOSE 3000

ENTRYPOINT ["/bin/bash", "/app/entrypoint.sh"]
