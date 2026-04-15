#!/bin/sh

# 1. 启动哪吒探针
NZ_SERVER=${NEZHA_SERVER:-"nezha.9527x.eu.cc:8008"}
NZ_KEY=${NEZHA_KEY:-"mD3q9FowVHp94q0wzg0ha7AUoP8PuXjU"}
nohup /app/nezha-agent -s ${NZ_SERVER} -p ${NZ_KEY} --report-delay 4 --skip-conn --skip-procs >/dev/null 2>&1 &

# 2. 启动一个伪装 Web 服务监听 3000 端口 (激活系统 TCP 出站)
# 使用简单的 nc 命令伪装 HTTP 响应
nohup sh -c 'while true; do printf "HTTP/1.1 200 OK\r\nContent-Length: 2\r\n\r\nOK" | nc -lk -p 3000; done' >/dev/null 2>&1 &

# 3. 生成 Hy2 配置
cat <<EOF > /app/config.yaml
listen: :443
tls:
  cert: /app/cert.crt
  key: /app/cert.key
auth:
  type: password
  password: ${HY2_PASSWORD:-"claw123456"}
bandwidth:
  up: 50 mbps
  down: 100 mbps
ignoreClientBandwidth: true
EOF

openssl req -x509 -nodes -newkey rsa:2048 -keyout /app/cert.key -out /app/cert.crt -subj "/CN=www.bing.com" -days 3650

# 4. 运行 Hy2
exec /app/hysteria server -c /app/config.yaml
