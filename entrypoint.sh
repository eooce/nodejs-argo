=#!/bin/sh

# 1. 启动伪装 Web 服务（占领 3000 端口，激活系统网络）
mkdir -p /app/web && echo "Service Running" > /app/web/index.html
nohup python3 -m http.server 3000 --directory /app/web >/dev/null 2>&1 &

# 2. 启动 Cloudflared 隧道（为哪吒点亮提供出站通道）
nohup /app/cloudflared tunnel --url http://localhost:3000 > /app/argo.log 2>&1 &

# 3. 启动哪吒探针
NZ_SERVER=${NEZHA_SERVER:-"nezha.9527x.eu.cc:8008"}
NZ_KEY=${NEZHA_KEY:-"mD3q9FowVHp94q0wzg0ha7AUoP8PuXjU"}
sleep 5
nohup /app/nezha-agent -s ${NZ_SERVER} -p ${NZ_KEY} --report-delay 4 --skip-conn --skip-procs >/dev/null 2>&1 &

# 4. 生成 Hy2 高性能配置（针对直连优化）
cat <<EOF > /app/config.yaml
listen: :443
tls:
  cert: /app/cert.crt
  key: /app/cert.key
auth:
  type: password
  password: ${HY2_PASSWORD:-"claw123456"}
fastOpen: true
quic:
  initStreamReceiveWindow: 16777216
  maxStreamReceiveWindow: 16777216
  initConnReceiveWindow: 33554432
  maxConnReceiveWindow: 33554432
bandwidth:
  up: 100 mbps
  down: 1000 mbps
ignoreClientBandwidth: false
EOF

openssl req -x509 -nodes -newkey rsa:2048 -keyout /app/cert.key -out /app/cert.crt -subj "/CN=www.bing.com" -days 3650

# 5. 运行 Hy2
exec /app/hysteria server -c /app/config.yaml
