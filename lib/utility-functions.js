const FtpClient = require("ftp");
const Future = require("fluture");
const NodeMailer = require("nodemailer");
const SftpClient = require("ssh2").Client;
const {getFileViaFtp, sendFileViaFtp} = require("./ftp");
const {getFileViaSftp, sendFileViaSftp} = require("./sftp");
const {sendFileViaEmail} = require("./email");

const createReadStream = (fs, fileName) => Future((reject, resolve) => {
  const readStream = fs.createReadStream(fileName, {"emitClose": true});
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

module.exports = {
  createReadStream,
  getFunctions,
  sendFunctions,
};
