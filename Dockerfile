FROM node:alpine3.20

# 1. 修改这里：将 /tmp 改为 /app
WORKDIR /app

# 2. 复制文件到 /app
COPY . .

EXPOSE 3000/tcp

RUN apk update && apk upgrade && \
    apk add --no-cache openssl curl gcompat iproute2 coreutils && \
    apk add --no-cache bash && \
    chmod +x index.js && \
    npm install

# 3. 此时启动命令会在 /app 目录下寻找 index.js
CMD ["node", "index.js"]
