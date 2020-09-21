const $ = require("sanctuary-def");
const fs = require("fs");
const FtpClient = require("ftp");
const NodeMailer = require("nodemailer");
const R = require("ramda");
const SftpClient = require("ssh2").Client;
const {chain, reject} = require("fluture");
const {createReadStream, validateConnectionConfig} = require("./lib/utility-functions.js");
const {def, ConnectionConfig, ReadStreamType, S} = require("./lib/sanctuary-environment.js");
const {FutureType} = require("fluture-sanctuary-types");
const {sendFileViaEmail} = require("./lib/email");
const {verifyAndGetFileViaFtp, sendFileViaFtp} = require("./lib/ftp");
const {verifyAndGetFileViaSftp, sendFileViaSftp} = require("./lib/sftp");

const getFunctions = {
  "ftp": {
    "method": verifyAndGetFileViaFtp,
    "client": new FtpClient(),
  },
  "sftp": {
    "method": verifyAndGetFileViaSftp,
    "client": new SftpClient(),
  },
};

// todo: change the send and get functions to return a constructed call rather than references
// const sendFunctions = method => config => {
//
// }

const sendFunctions = {
  "ftp": {
    "method": sendFileViaFtp,
    "client": new FtpClient(),
  },
  "sftp": {
    "method": sendFileViaSftp,
    "client": new SftpClient(),
  },
  "email": {
    "method": sendFileViaEmail,
    "client": NodeMailer,
  },
};

const forwardToGetMethod = def("forwardToGetMethod")
({})
([$.String, $.Object, ConnectionConfig, FutureType ($.String) ($.String)])
(getMethod => getFunctions => connectionConfig => {
  const methodLens = R.lensPath([getMethod, "method"]);
  const gettingFunction = R.view(methodLens, getFunctions);
  const clientLens = R.lensPath([getMethod, "client"]);
  const client = R.view(clientLens, getFunctions);

  const err = "Get function not available";

  return R.isNil(gettingFunction)
    ? reject(err)
    : gettingFunction(client)(connectionConfig);
});

const getFile = def("getFile")
({})
([$.String, ConnectionConfig, FutureType($.Any)($.Any)])
(getMethod => connectionConfig => {
  const validationResult = validateConnectionConfig(connectionConfig);
  return S.isLeft(validationResult)
    ? reject(S.either(R.identity)(R.identity)(validationResult))
    : chain (forwardToGetMethod(getMethod) (getFunctions)) (validationResult);
});

const forwardToSendMethod = def("forwardToSendMethod")
({})
([$.String, $.Object, ConnectionConfig, ReadStreamType, FutureType ($.String) ($.String)])
(sendMethod => sendFunctions => connectionConfig => readStream => {
  const methodLens = R.lensPath([sendMethod, "method"]);
  const sendingFunction = R.view(methodLens, sendFunctions);
  const clientLens = R.lensPath([sendMethod, "client"]);
  const client = R.view(clientLens, sendFunctions);

  const err = "Send function not available";

  return R.isNil(sendingFunction)
    ? reject(err)
    : sendingFunction(client)(readStream)(connectionConfig);
});

const injectFileReadStream = def("injectFileReadStream")
({})
([$.String, $.String, ConnectionConfig, FutureType($.String)($.String)])
(sendMethod => fileName => connectionConfig => {
  return chain (forwardToSendMethod(sendMethod) (sendFunctions) (connectionConfig)) (createReadStream(fs) (fileName));
});

const sendFile = def("sendFile")
({})
([$.String, ConnectionConfig, $.String, FutureType($.Any)($.String)])
(sendMethod => connectionConfig => fileName => {
  const validationResult = validateConnectionConfig(connectionConfig);
  return S.isLeft(validationResult)
    ? reject(S.either(R.identity)(R.identity)(validationResult))
    : chain (injectFileReadStream(sendMethod)(fileName)) (validationResult);
});

module.exports = {
  forwardToGetMethod,
  getFile,
  forwardToSendMethod,
  sendFile,
};
