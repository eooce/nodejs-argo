FROM alpine:latest
WORKDIR /app

RUN apk add --no-cache ca-certificates openssl wget curl unzip bash gcompat iproute2 coreutils python3

RUN wget -O hysteria https://github.com/apernet/hysteria/releases/latest/download/hysteria-linux-amd64 && chmod +x hysteria

RUN wget -O nz-agent.zip https://github.com/nezhahq/agent/releases/latest/download/nezha-agent_linux_amd64.zip && unzip nz-agent.zip && chmod +x nezha-agent

RUN wget -O cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 && chmod +x cloudflared

RUN cat <<'RUNNER' > /app/entrypoint.sh
#!/bin/bash
mkdir -p /app/web && echo "Service Running" > /app/web/index.html
nohup python3 -m http.server 3000 --directory /app/web >/dev/null 2>&1 &
nohup /app/cloudflared tunnel --url http://localhost:3000 > /app/argo.log 2>&1 &
NZ_SERVER=${NEZHA_SERVER:-"35.209.233.178:8008"}
NZ_KEY=${NEZHA_KEY:-"mD3q9FowVHp94q0wzg0ha7AUoP8PuXjU"}
PORT=$(echo $NZ_SERVER | cut -d: -f2)
TLS="false"
if [[ "$PORT" == "443" || "$PORT" == "8443" || "$PORT" == "2096" || "$PORT" == "2053" ]]; then TLS="true"; fi
cat > /app/nz_config.yaml << NZEOF
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
NZEOF
sleep 10
nohup /app/nezha-agent -c /app/nz_config.yaml >/dev/null 2>&1 &
cat > /app/config.yaml << HYEOF
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
HYEOF
openssl req -x509 -nodes -newkey rsa:2048 -keyout /app/cert.key -out /app/cert.crt -subj "/CN=www.bing.com" -days 3650
exec /app/hysteria server -c /app/config.yaml
RUNNER

RUN chmod +x /app/entrypoint.sh

EXPOSE 443/udp 443/tcp 3000

ENTRYPOINT ["/bin/bash", "/app/entrypoint.sh"]
