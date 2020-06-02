const $ = require("sanctuary-def");
const R = require("ramda");
const fs = require("fs");
const {FutureType} = require("fluture-sanctuary-types");
const {def, ConnectionConfig, ReadStreamType} = require("./lib/sanctuary-environment.js");
const {reject} = require("fluture");
const {createReadStream, sendFunctions} = require("./lib/utility-functions");

const forwardToSendMethod = def("forwardToSendMethod")
({})
([$.String, ConnectionConfig, $.Unknown, ReadStreamType, FutureType ($.String) ($.String)])
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
([$.String, ConnectionConfig, $.Unknown, $.Unknown])
(sendMethod => connectionConfig => fileName => {
  return R.pipe(createReadStream, forwardToSendMethod(sendMethod) (connectionConfig) (sendFunctions)) ((fs, fileName));
});

module.exports = {
  forwardToSendMethod,
  sendFile,
};
