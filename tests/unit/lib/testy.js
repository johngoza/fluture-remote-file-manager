const {sendFile} = require("../../../index.js");
const NodeMailer = require("nodemailer");
const fs = require("fs");
const {fork} = require("fluture");

const message = {
  "to": "jackgoza@gmail.com",
  "from": "jgoza@q6inc.com",
  "subject": "this is a test",
  "text": "hi!",
};

const config = {
  "host": "smtp.gmail.com",
  "port": 587,
  "remoteFilePath": "hello.txt",
  "auth": {
    "user": "jgoza@q6inc.com",
    "pass": "iysxavtprstaxaop",
  },
  "message": message,
};

fork
(console.log)
(console.log)
(sendFile("email") (config) ("tests/unit/resources/hello.txt"));
