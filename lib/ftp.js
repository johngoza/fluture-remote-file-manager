const $ = require("sanctuary-def");
const {FutureType} = require("fluture-sanctuary-types");
const {def, ConnectionConfig, FtpType, ReadStreamType} = require("./sanctuary-environment");
const {Future} = require("fluture");

// sendFile :: String -> ConnectionConfig -> Future
const sendFileViaFtp =
  def("sendFileViaFtp")
  ({})
  ([FtpType, ReadStreamType, ConnectionConfig, FutureType($.String)($.Integer)])
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
