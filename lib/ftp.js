const $ = require("sanctuary-def");
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
        if (err) {
          reject(err);
        }

        ftpClient.end();
        resolve("Upload successful");
      });
    });

    ftpClient.on("error", (err) => {
      ftpClient.end();
      reject(err.code.toString() + " " + err.message.toString());
    });

    ftpClient.connect(connectionConfig);

    return () => { };
  }));

module.exports = {
  sendFileViaFtp,
};
