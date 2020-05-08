const $ = require('sanctuary-def');
const { FutureType } = require('fluture-sanctuary-types')
const def = require('../lib/sanctuaryEnvirnoment');
const fs = require('fs');
const FTP = require('ftp');
const {reject, resolve} = require('fluture');

// SendFile :: String -> FtpConnectionConfig -> Future
const SendFile =
    def('SendFile')
        ({})
        ([$.String, FtpConnectionConfig, F$.FutureType ($.String) ($.String)]) // todo: change this to common log shape once defined
        (filePath => connectionConfig => {
            const file = fs.readFile(filePath, (err) => {
                reject("Failed to read data from file due to: " + err); // todo: same as above
            });

            const remotePath = connectionConfig['remoteFilePath'];
            delete connectionConfig.remoteFilePath;

            const ftpClient = new FTP();
            ftpClient.connect(connectionConfig);
            ftpClient.put(file, remotePath, (err) => {
                reject("Put to FTP failed with error: " + err); // todo: same as above
            });

            return resolve('File sent successfully'); // todo: same as above
        })

module.exports = {
    SendFile
}