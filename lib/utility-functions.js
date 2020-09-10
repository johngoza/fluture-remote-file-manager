const FtpClient = require("ftp");
const Future = require("fluture");
const NodeMailer = require("nodemailer");
const R = require("ramda");
const SftpClient = require("ssh2").Client;
const {getFileViaFtp, sendFileViaFtp} = require("./ftp");
const {getFileViaSftp, sendFileViaSftp} = require("./sftp");
const {sendFileViaEmail} = require("./email");

// todo: this could be sanc-def'd
const createReadStream = fs => fileName => Future((reject, resolve) => {
  const readStream = fs.createReadStream(fileName);
  readStream.on("error", (err) => {
    reject("Unable to read file. " + err.code.toString() + " " + err.message.toString());
  });

  readStream.on("ready", () => {
    resolve(readStream);
  });

  return () => {};
});

const getFunctions = {
  "ftp": {
    "method": getFileViaFtp,
    "client": new FtpClient(),
  },
  "sftp": {
    "method": getFileViaSftp,
    "client": new SftpClient(),
  },
};

const sendFunctions = {
  "ftp": {
    "method": sendFileViaFtp,
    "client": new FtpClient(),
  },
  "sftp": {
    "method": sendFileViaSftp,
    "client": new SftpClient(),
  },
  "email": {
    "method": sendFileViaEmail,
    "client": NodeMailer,
  },
};

// this is not defined using sanctuary-def as it would break our ability to test it
// this is intended for runtime checking so having all test cases is important
const validateConnectionConfig = (connectionConfig) => Future((reject, resolve) => {
  const errors = [];

  R.isEmpty(connectionConfig.host) || R.isNil(connectionConfig.host) || typeof connectionConfig.host !== "string"
    ? errors.push("host is missing or invalid") : errors.push(null);

  R.isEmpty(connectionConfig.port) || R.isNil(connectionConfig.port) ||
  !Number.isInteger(connectionConfig.port) || connectionConfig.port < 1
    ? errors.push("port is missing or invalid") : errors.push(null);

  R.isEmpty(connectionConfig.remoteFilePath) || R.isNil(connectionConfig.remoteFilePath) ||
  typeof connectionConfig.remoteFilePath !== "string"
    ? errors.push("remoteFilePath is missing or invalid") : errors.push(null);

  R.all(R.equals(null))(errors) ? resolve(connectionConfig) : reject(R.reject(R.isNil, errors));

  return () => { };
});

module.exports = {
  createReadStream,
  getFunctions,
  sendFunctions,
  validateConnectionConfig,
};
