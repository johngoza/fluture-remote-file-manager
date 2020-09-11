const $ = require("sanctuary-def");
const R = require("ramda");
const {def, FtpConnectionConfig, FtpClientType, ReadStreamType} = require("./sanctuary-environment");
const {FutureType} = require("fluture-sanctuary-types");
const {Future} = require("fluture");

const getFileViaFtp =
  def("getFileViaFtp")
  ({})
  ([FtpClientType, FtpConnectionConfig, FutureType($.String)($.Void)])
  (ftpClient => connectionConfig => Future((reject, resolve) => {
    const remotePath = connectionConfig.remoteFileName;
    ftpClient.on("ready", function() {
      ftpClient.get(remotePath, function(err, stream) {
        if (err) {
          ftpClient.end();
          return reject(err.code.toString() + " " + err.message.toString());
        };

        stream.once("close", function() {
          ftpClient.end();
        });

        return resolve(stream);
      });
    });

    ftpClient.on("error", (err) => {
      ftpClient.end();
      return reject(err.code.toString() + " " + err.message.toString());
    });

    ftpClient.connect(connectionConfig);

    return () => { };
  }));

const sendFileViaFtp =
  def("sendFileViaFtp")
  ({})
  ([FtpClientType, ReadStreamType, FtpConnectionConfig, FutureType($.String)($.String)])
  (ftpClient => readStream => connectionConfig => Future((reject, resolve) => {
    const remotePath = connectionConfig.remoteFileName;

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
  getFileViaFtp,
  sendFileViaFtp,
};
