FROM alpine:latest
WORKDIR /app
RUN apk add --no-cache ca-certificates openssl wget curl unzip bash gcompat iproute2 coreutils python3

# 下载二进制文件
RUN arch=$(uname -m); \
    if [ "$arch" = "x86_64" ]; then export ARCH="amd64"; else export ARCH="arm64"; fi; \
    wget -O hysteria https://github.com/apernet/hysteria/releases/latest/download/hysteria-linux-$ARCH && chmod +x hysteria; \
    wget -O nezha-agent.zip https://github.com/nezhahq/agent/releases/latest/download/nezha-agent_linux_$ARCH.zip && unzip nezha-agent.zip && chmod +x nezha-agent; \
    wget -O cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-$ARCH && chmod +x cloudflared

# 直接在此生成 entrypoint.sh，彻底解决格式问题
RUN printf '#!/bin/bash\n\
mkdir -p /app/web && echo "Service Running" > /app/web/index.html\n\
nohup python3 -m http.server 3000 --directory /app/web >/dev/null 2>&1 &\n\
nohup /app/cloudflared tunnel --url http://localhost:3000 > /app/argo.log 2>&1 &\n\
NZ_SERVER=${NEZHA_SERVER:-"nezha.9527x.eu.cc:8008"}\n\
NZ_KEY=${NEZHA_KEY:-"mD3q9FowVHp94q0wzg0ha7AUoP8PuXjU"}\n\
sleep 5\n\
nohup /app/nezha-agent -s ${NZ_SERVER} -p ${NZ_KEY} --report-delay 4 --skip-conn --skip-procs >/dev/null 2>&1 &\n\
cat <<EOF > /app/config.yaml\n\
listen: :443\n\
tls:\n\
  cert: /app/cert.crt\n\
  key: /app/cert.key\n\
auth:\n\
  type: password\n\
  password: ${HY2_PASSWORD:-"claw123456"}\n\
fastOpen: true\n\
quic:\n\
  initStreamReceiveWindow: 16777216\n\
  maxStreamReceiveWindow: 16777216\n\
  initConnReceiveWindow: 33554432\n\
  maxConnReceiveWindow: 33554432\n\
bandwidth:\n\
  up: 100 mbps\n\
  down: 1000 mbps\n\
ignoreClientBandwidth: false\n\
EOF\n\
openssl req -x509 -nodes -newkey rsa:2048 -keyout /app/cert.key -out /app/cert.crt -subj "/CN=www.bing.com" -days 3650\n\
exec /app/hysteria server -c /app/config.yaml' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

EXPOSE 443/udp
EXPOSE 443/tcp
EXPOSE 3000

ENTRYPOINT ["/bin/bash", "/app/entrypoint.sh"]
