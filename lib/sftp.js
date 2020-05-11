const $ = require('sanctuary-def');
const { FutureType } = require('fluture-sanctuary-types')
const { def, FtpConnectionConfig } = require('./sanctuaryEnvironment');
const { Future } = require('fluture');

// validate incoming SftpConnection
// migrate connection lines below to index when ready
// const ssh2 = require('ssh2');
// const client = ssh2.Client;
// const conn = new client();

// sendFileViaSftp :: String -> FtpConnectionConfig -> Future
const sendFileViaSftp =
    def('sendFileViaSftp')
        ({})
        ([$.Unknown, $.Unknown, FtpConnectionConfig, FutureType($.String)($.String)]) // todo: change this to common log shape once defined
        (client => readStream => connectionConfig => Future((reject, resolve) => {
            client.on('ready', () => {
                client.sftp((err, sftp) => {
                    if (err) {
                        reject(err); // todo: same as above
                    }

                    const writeStream = sftp.createWriteStream(remoteFilePath);
                    writeStream.on('error', () => {
                        conn.end();
                        reject(err);  // todo: same as above
                    });
                    writeStream.on('close', () => {
                        conn.end();
                        resolve("Succesfully uploaded the file " + fileName + " to remote path " + remoteFilePath);
                    });

                    readStream.pipe(writeStream);
                });
            }).connect(connectionConfig);
            return () => { };
        })
        )

module.exports = {
    sendFileViaSftp
}