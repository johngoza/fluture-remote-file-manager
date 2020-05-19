FROM node:14.2.0-alpine3.10

COPY ./package.json .
RUN npm install

COPY ./lib lib
COPY ./tests/system ./tests/system
COPY ./tests/unit ./tests/unit

EXPOSE 21 21000-21010

CMD ["npm", "run", "system-test"]