FROM alpine:latest
WORKDIR /app
RUN apk add --no-cache ca-certificates openssl wget curl unzip bash gcompat iproute2 coreutils python3

# 下载所需二进制文件
RUN arch=$(uname -m); \
    if [ "$arch" = "x86_64" ]; then export ARCH="amd64"; else export ARCH="arm64"; fi; \
    wget -O hysteria https://github.com/apernet/hysteria/releases/latest/download/hysteria-linux-$ARCH && chmod +x hysteria; \
    wget -O nz-agent.zip https://github.com/nezhahq/agent/releases/latest/download/nezha-agent_linux_$ARCH.zip && unzip nz-agent.zip && chmod +x nezha-agent; \
    wget -O cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-$ARCH && chmod +x cloudflared

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 443/udp
EXPOSE 443/tcp
EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]
