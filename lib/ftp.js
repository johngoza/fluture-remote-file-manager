const $ = require('sanctuary-def');
const S = require('sanctuary');
const { FutureType } = require('fluture-sanctuary-types')
const { def, FtpConnectionConfig } = require('../lib/sanctuaryEnvirnoment');
const {Future, reject, resolve} = require('fluture');
// validate incoming FtpConnection
// sendFile :: String -> FtpConnectionConfig -> Future
const sendFile =
    def ('sendFile')
        ({})
        ([$.Unknown, $.Unknown, FtpConnectionConfig, FutureType ($.String) ($.String)]) // todo: change this to common log shape once defined
        (ftpClient => readStream => connectionConfig => Future((reject, resolve) => {
            const remotePath = connectionConfig['remoteFilePath'];
            ftpClient.connect(connectionConfig);
            ftpClient.put(readStream, remotePath, (err) => {
                if(err) {
                  reject("Put to FTP failed with error: " + err); // todo: same as above
                } else {
                  resolve('File sent successfully'); // todo: same as above
                }
            });
            return () => {}  // cancellation function
          })
        )
module.exports = {
    sendFile
}