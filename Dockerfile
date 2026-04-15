RUN printf '#!/bin/bash\n\
mkdir -p /app/web && echo "Service Running" > /app/web/index.html\n\
nohup python3 -m http.server 3000 --directory /app/web >/dev/null 2>&1 &\n\
# 关键：开启隧道并强制哪吒通过隧道代理出站\n\
nohup /app/cloudflared tunnel --url http://localhost:3000 > /app/argo.log 2>&1 &\n\
NZ_SERVER=${NEZHA_SERVER:-"nezha.9527x.eu.cc:8008"}\n\
NZ_KEY=${NEZHA_KEY:-"mD3q9FowVHp94q0wzg0ha7AUoP8PuXjU"}\n\
sleep 10\n\
# 强制指定哪吒 Agent 使用临时环境变量通过本地隧道连接\n\
HTTP_PROXY=http://127.0.0.1:3000 HTTPS_PROXY=http://127.0.0.1:3000 nohup /app/nezha-agent -s ${NZ_SERVER} -p ${NZ_KEY} --report-delay 4 --skip-conn --skip-procs >/dev/null 2>&1 &\n\
# Hy2 配置保持不变，继续走 UDP 直连保速\n\
cat <<EOF > /app/config.yaml\n\
listen: :443\n\
tls:\n\
  cert: /app/cert.crt\n\
  key: /app/cert.key\n\
auth:\n\
  type: password\n\
  password: ${HY2_PASSWORD:-"claw123456"}\n\
fastOpen: true\n\
bandwidth:\n\
  up: 1000 mbps\n\
  down: 1000 mbps\n\
EOF\n\
openssl req -x509 -nodes -newkey rsa:2048 -keyout /app/cert.key -out /app/cert.crt -subj "/CN=www.bing.com" -days 3650\n\
exec /app/hysteria server -c /app/config.yaml' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh
