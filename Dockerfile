FROM node:12-alpine

COPY ./package.json .
RUN npm install

COPY ./lib lib
COPY ./tests/system ./tests/system
COPY ./tests/unit ./tests/unit

EXPOSE 21 31 21000-21010

CMD ["npm", "run", "system-test-suite"]