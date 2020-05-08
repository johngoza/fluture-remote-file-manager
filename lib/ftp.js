const $ = require('sanctuary-def');
const fs = require('fs');
const FTP = require('ftp');
const Future = require('fluture');

// FtpConnectionConfig :: Type
// host - string, port - integer, secure - unknown, secureOptions - object/unknown
// user - string, password - string, connTimeout - integer, pasvtimeout - integer, keepalive - integer
// only enforce required vars here. if someone wants to pass timeout values more power to em
const FtpConnectionConfig =
    $.RecordType({
        host: $.String, port: $.NonNegativeInteger, remoteFilePath: $.String, user: $.String, password: $.String
    })

//    env :: Array Type
const env = $.env.concat([FtpConnectionConfig]);
const def = $.create({
    checkTypes: process.env.NODE_ENV === 'development',
    env,
});

// put :: String -> FtpConnectionConfig -> Future
const put =
    def('put')
        ({})
        ([$.String, FtpConnectionConfig, Future])
        (filePath => connectionConfig => {
            const file = fs.readFile(filePath, (err) => {
                reject("Failed to read data from file due to: " + err);
            });

            const remotePath = connectionConfig['remoteFilePath'];
            delete connectionConfig.remoteFilePath;

            const ftpClient = new FTP();
            ftpClient.connect(connectionConfig);
            ftpClient.put(file, remotePath, (err) => {
                reject("Put to FTP failed with error: " + err);
            })
        })

module.exports = {
    FtpConnectionConfig,
    put
}