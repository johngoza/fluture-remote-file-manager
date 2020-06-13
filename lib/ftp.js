const $ = require("sanctuary-def");
const R = require("ramda");
const {def, ConnectionConfig, FtpClientType, ReadStreamType} = require("./sanctuary-environment");
const {FutureType} = require("fluture-sanctuary-types");
const {Future} = require("fluture");

const sendFileViaFtp =
  def("sendFileViaFtp")
  ({})
  ([FtpClientType, ReadStreamType, ConnectionConfig, FutureType($.String)($.String)])
  (ftpClient => readStream => connectionConfig => Future((reject, resolve) => {
    const remotePath = connectionConfig.remoteFilePath;

    ftpClient.on("ready", () => {
      ftpClient.put(readStream, remotePath, (err) => {
        ftpClient.end();
        R.isNil(err)
          ? resolve("Upload successful")
          : reject(err.code.toString() + " " + err.message.toString());
      });
    });

    ftpClient.on("error", (err) => {
      ftpClient.end();
      return reject(err.code.toString() + " " + err.message.toString());
    });

    ftpClient.connect(connectionConfig);

    return () => { };
  }));

module.exports = {
  sendFileViaFtp,
};
