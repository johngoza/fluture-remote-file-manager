const $ = require('sanctuary-def');
const { FutureType } = require('fluture-sanctuary-types')
const { def, FtpConnectionConfig } = require('./sanctuaryEnvironment');
const { Future } = require('fluture');
const FtpClient = require('ftp');
var SftpClient = require('ssh2').Client;
const sendFileViaFtp = require('./lib/ftp');
const sendFileViaSftp = require('./lib/sftp');

def('sendFile')
({})
([$.String, $.Unknown, FtpConnectionConfig, FutureType($.String)($.String)])
(sendMethod => readStream => connectionConfig => Future((reject, resolve) => {
  switch(sendMethod) {
    case "ftp":
      return sendFileViaFtp(new FtpClient(), readStream, connectionConfig);
    case "sftp":
      return sendFileViaSftp(new SftpClient(), readStream, connectionConfig);
    default:
      reject("Send method not implemented");
  }
}));