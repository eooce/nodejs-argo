FROM node:alpine3.22

WORKDIR /tmp

COPY index.js index.html package.json ./

EXPOSE 3000/tcp

RUN apk update && apk upgrade &&\
    apk add --no-cache openssl curl gcompat iproute2 coreutils &&\
    apk add --no-cache bash &&\
    chmod +x index.js &&\
    npm install

CMD ["node", "index.js"]
