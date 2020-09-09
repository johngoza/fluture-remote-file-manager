const FtpClient = require("ftp");
const Future = require("fluture");
const NodeMailer = require("nodemailer");
const R = require("ramda");
const SftpClient = require("ssh2").Client;
const {getFileViaFtp, sendFileViaFtp} = require("./ftp");
const {getFileViaSftp, sendFileViaSftp} = require("./sftp");
const {sendFileViaEmail} = require("./email");

const createReadStream = (fs, fileName) => Future((reject, resolve) => {
  const readStream = fs.createReadStream(fileName);
  readStream.on("error", (err) => {
    return reject("Unable to read file. " + err.code.toString() + " " + err.message.toString());
  });

  readStream.on("ready", () => {
    return resolve(readStream);
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

  R.isEmpty(connectionConfig.host) || R.isNil(connectionConfig.host)
    ? errors.push("host is missing or empty") : errors.push(null);

  R.isEmpty(connectionConfig.port) || R.isNil(connectionConfig.port)
    ? errors.push("port is missing or empty") : errors.push(null);

  R.isEmpty(connectionConfig.remoteFilePath) || R.isNil(connectionConfig.remoteFilePath)
    ? errors.push("remoteFilePath is missing or empty") : errors.push(null);

  R.all(R.equals(null))(errors) ? resolve(connectionConfig) : reject(R.reject(R.isNil, errors));

  return () => { };
});

module.exports = {
  createReadStream,
  getFunctions,
  sendFunctions,
  validateConnectionConfig,
};
