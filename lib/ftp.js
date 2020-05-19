const $ = require('sanctuary-def');
const S = require('sanctuary');
const { FutureType } = require('fluture-sanctuary-types')
const { def, FtpConnectionConfig } = require('./sanctuaryEnvironment');
const { Future } = require('fluture');

// validate incoming FtpConnection

// sendFile :: String -> FtpConnectionConfig -> Future
const sendFileViaFtp =
  def('sendFileViaFtp')
    ({})
    ([$.Unknown, $.Unknown, FtpConnectionConfig, FutureType($.String)($.String)]) // todo: change this to common log shape once defined
    (ftpClient => readStream => connectionConfig => Future((reject, resolve) => {
      const remotePath = connectionConfig['remoteFilePath'];
      ftpClient.connect(connectionConfig);
      ftpClient.put(readStream, remotePath, (err) => {
        ftpClient.end();
        if (err) {
          reject("Upload failed: " + err); // todo: same as above
        } else {
          resolve("Upload successful"); // todo: same as above
        }
      });
      return () => { }  // cancellation function
    })
    )

module.exports = {
  sendFileViaFtp
}