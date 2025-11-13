FROM node:alpine3.20

WORKDIR /app

COPY . .

EXPOSE 3000/tcp

RUN apk update && apk upgrade && \
    apk add --no-cache openssl curl gcompat iproute2 coreutils bash && \
    chmod +x index.js && \
    npm install

CMD ["node", "index.js"]

