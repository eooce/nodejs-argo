FROM node:lts-alpine3.18

WORKDIR /app

COPY . .

EXPOSE 3000

RUN apk update && apk add curl &&\
    npm install 
    
CMD ["node", "index.js"]
