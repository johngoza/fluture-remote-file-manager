const Future = require("fluture");
const FtpClient = require("ftp");
const SftpClient = require("ssh2").Client;
const {sendFileViaFtp} = require("./ftp");
const {sendFileViaSftp} = require("./sftp");

const base64EncodeData = (data) => Future((reject, resolve) => {
  try {
    const buffer = Buffer.from(data);
    resolve(buffer.toString("base64"));
  } catch (err) {
    reject(err);
  }

  return () => {};
});

const createReadStream = (fs, fileName) => Future((reject, resolve) => {
  const readStream = fs.createReadStream(fileName);
  readStream.on("error", (err) => {
    reject("Unable to read file. " + err.code.toString() + " " + err.message.toString());
  });

  readStream.on("ready", () => {
    resolve(readStream);
  });

  return () => {};
});

const sendFunctions = {
  "ftp": {
    "method": sendFileViaFtp,
    "client": new FtpClient(),
  },
  "sftp": {
    "method": sendFileViaSftp,
    "client": new SftpClient(),
  },
};

module.exports = {
  base64EncodeData,
  createReadStream,
  sendFunctions,
};
