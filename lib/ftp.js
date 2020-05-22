const $ = require("sanctuary-def");
const {FutureType} = require("fluture-sanctuary-types");
const {def, FtpConnectionConfig} = require("./sanctuaryEnvironment");
const {Future} = require("fluture");

// validate incoming FtpConnection

// sendFile :: String -> FtpConnectionConfig -> Future
const sendFileViaFtp =
  def("sendFileViaFtp")
  ({})
  ([$.Unknown, $.Unknown, FtpConnectionConfig, FutureType($.String)($.String)]) // todo: change this file to use common log shape once defined
  (ftpClient => readStream => connectionConfig => Future((reject, resolve) => {
    const remotePath = connectionConfig.remoteFilePath;

    ftpClient.on("ready", () => {
      ftpClient.put(readStream, remotePath, (err) => {
        ftpClient.end();

        if (err) {
          reject(err);
        }

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
