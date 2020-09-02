FROM node:12-alpine

COPY ./package.json .
# --ignore-scripts prevents a ton of irrelevant output from node mailer
# don't delete it
RUN npm install --ignore-scripts

COPY index.js index.js
COPY ./lib lib
COPY ./tests/system ./tests/system

EXPOSE 21 31 21000-21010

CMD ["npm", "run", "system-test-suite"]
