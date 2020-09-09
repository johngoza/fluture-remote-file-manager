const $ = require("sanctuary-def");
const fs = require("fs");
const R = require("ramda");
const {chain, reject} = require("fluture");
const {createReadStream, getFunctions, sendFunctions, validateConnectionConfig} = require("./lib/utility-functions.js");
const {def, ConnectionConfig, ReadStreamType} = require("./lib/sanctuary-environment.js");
const {FutureType} = require("fluture-sanctuary-types");

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
([$.String, ConnectionConfig, FutureType($.String)($.Any)])
(getMethod => connectionConfig => {
  return chain (forwardToGetMethod(getMethod) (getFunctions)) (validateConnectionConfig(connectionConfig));
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

const sendFile = def("sendFile")
({})
([$.String, ConnectionConfig, $.String, FutureType($.String)($.String)])
(sendMethod => connectionConfig => fileName => {
  return chain (forwardToSendMethod(sendMethod) (sendFunctions) (connectionConfig)) (createReadStream(fs, fileName));
});

module.exports = {
  forwardToGetMethod,
  getFile,
  forwardToSendMethod,
  sendFile,
};
