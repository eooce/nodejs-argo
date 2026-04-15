#!/bin/sh

# 1. 启动哪吒 (从环境变量读取)
NZ_SERVER=${NEZHA_SERVER:-"nezha.9527x.eu.cc:8008"}
NZ_KEY=${NEZHA_KEY:-"mD3q9FowVHp94q0wzg0ha7AUoP8PuXjU"}

nohup /app/nezha-agent -s ${NZ_SERVER} -p ${NZ_KEY} --report-delay 4 --skip-conn --skip-procs >/dev/null 2>&1 &

# 2. 生成 Hy2 配置文件
cat <<EOF > /app/config.yaml
listen: :443
tls:
  cert: /app/cert.crt
  key: /app/cert.key
auth:
  type: password
  password: ${HY2_PASSWORD:-"claw123456"}
quic:
  initStreamReceiveWindow: 8388608
  maxStreamReceiveWindow: 8388608
  initConnReceiveWindow: 20971520
  maxConnReceiveWindow: 20971520
bandwidth:
  up: 50 mbps
  down: 100 mbps
ignoreClientBandwidth: true
EOF

# 3. 生成自签名证书
openssl req -x509 -nodes -newkey rsa:2048 -keyout /app/cert.key -out /app/cert.crt -subj "/CN=www.bing.com" -days 3650

# 4. 运行 Hy2
exec /app/hysteria server -c /app/config.yaml
