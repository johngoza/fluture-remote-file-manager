FROM node:12-alpine

COPY ./emailpackage.json ./package.json

RUN npm install

COPY ./smtp-server.js ./smtp-server.js

EXPOSE 587

CMD ["node", "smtp-server.js"]