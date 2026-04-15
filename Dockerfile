FROM alpine:latest
WORKDIR /app
RUN apk add --no-cache ca-certificates openssl wget curl unzip

# 下载 Hy2 和 哪吒 (自动匹配架构)
RUN arch=$(uname -m); \
    if [ "$arch" = "x86_64" ]; then export ARCH="amd64"; else export ARCH="arm64"; fi; \
    wget -O hysteria https://github.com/apernet/hysteria/releases/latest/download/hysteria-linux-$ARCH && \
    chmod +x hysteria; \
    wget -O nezha-agent.zip https://github.com/nezhahq/agent/releases/latest/download/nezha-agent_linux_$ARCH.zip && \
    unzip nezha-agent.zip && chmod +x nezha-agent

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# 暴露端口
EXPOSE 443/udp
EXPOSE 443/tcp

ENTRYPOINT ["/app/entrypoint.sh"]
