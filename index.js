const $ = require("sanctuary-def");
const fs = require("fs");
const R = require("ramda");
const {chain, reject} = require("fluture");
const {createReadStream, getFunctions, sendFunctions} = require("./lib/utility-functions.js");
const {def, ConnectionConfig, ReadStreamType, WriteStreamType} = require("./lib/sanctuary-environment.js");
const {FutureType} = require("fluture-sanctuary-types");

const forwardToGetMethod = def("forwardToGetMethod")
({})
([$.String, ConnectionConfig, $.Object, WriteStreamType, FutureType ($.String) ($.String)])
(getMethod => connectionConfig => getFunctions => writeStream => {
  const methodLens = R.lensPath([getMethod, "method"]);
  const gettingFunction = R.view(methodLens, getFunctions);
  const clientLens = R.lensPath([getMethod, "client"]);
  const client = R.view(clientLens, getFunctions);

  const err = "Send function not available";

  return R.isNil(gettingFunction)
    ? reject(err)
    : gettingFunction(client)(writeStream)(connectionConfig);
});

const getFile = def("getFile")
({})
([$.String, ConnectionConfig, $.Unknown, $.Unknown])
(getMethod => connectionConfig => writableStream => {
  return forwardToGetMethod(getMethod) (connectionConfig) (getFunctions) (writableStream);
});

const forwardToSendMethod = def("forwardToSendMethod")
({})
([$.String, ConnectionConfig, $.Object, ReadStreamType, FutureType ($.String) ($.String)])
(sendMethod => connectionConfig => sendFunctions => readStream => {
  const methodLens = R.lensPath([sendMethod, "method"]);
  const sendingFunction = R.view(methodLens, sendFunctions);
  const clientLens = R.lensPath([sendMethod, "client"]);
  const client = R.view(clientLens, sendFunctions);

  const err = "Send function not available";

  return R.isNil(sendingFunction)
    ? reject(err)
    : sendingFunction(client)(readStream)(connectionConfig);
});

const sendFile = def("sendFile")
({})
([$.String, ConnectionConfig, $.String, $.Unknown])
(sendMethod => connectionConfig => fileName => {
  return chain (forwardToSendMethod(sendMethod) (connectionConfig) (sendFunctions)) (createReadStream(fs, fileName));
});

module.exports = {
  forwardToGetMethod,
  getFile,
  forwardToSendMethod,
  sendFile,
};
