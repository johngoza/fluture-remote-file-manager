const $ = require('sanctuary-def');
const S = require('sanctuary');
const { FutureType } = require('fluture-sanctuary-types')
const { def, FtpConnectionConfig } = require('../lib/sanctuaryEnvirnoment');
const {reject, resolve} = require('fluture');

// validate incoming FtpConnection

// SendFile :: String -> FtpConnectionConfig -> Future
const SendFile =
    def ('SendFile')
        ({})
        ([$.Unknown, $.Unknown, FtpConnectionConfig, FutureType ($.String) ($.String)]) // todo: change this to common log shape once defined
        (ftpClient => readStream => connectionConfig => {
            const remotePath = connectionConfig['remoteFilePath'];

            ftpClient.connect(connectionConfig);

            ftpClient.put(readStream, remotePath, (err) => {
                reject("Put to FTP failed with error: " + err); // todo: same as above
            });

            return resolve('File sent successfully'); // todo: same as above
        })

module.exports = {
    SendFile
}