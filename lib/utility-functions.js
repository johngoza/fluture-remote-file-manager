const $ = require("sanctuary-def");
const crypto = require("crypto");
const Future = require("fluture");
const R = require("ramda");
const {def, ReadStreamType} = require("./sanctuary-environment");
const {FutureType} = require("fluture-sanctuary-types");

const createObjectHash = def("createObjectHash")
({})
([$.String, $.String])
(objectString => {
  const hash = crypto.createHash("md5");
  return hash.update(objectString).digest("hex");
});

const createReadStream = def("createReadStream")
({})
([$.Any, $.String, FutureType($.String)(ReadStreamType)])
(fs => fileName => Future((reject, resolve) => {
  const readStream = fs.createReadStream(fileName);
  readStream.on("error", (err) => {
    reject("Unable to read file. " + err.code.toString() + " " + err.message.toString());
  });

  readStream.on("ready", () => {
    resolve(readStream);
  });

  return () => {};
}));

// this is not defined using sanctuary-def as it would break our ability to test it
// this is intended for runtime checking so having all test cases is important
const validateConnectionConfig = (connectionConfig) => Future((reject, resolve) => {
  const errors = [];

  R.isEmpty(connectionConfig.host) || R.isNil(connectionConfig.host) || typeof connectionConfig.host !== "string"
    ? errors.push("host is missing or invalid") : errors.push(null);

  R.isEmpty(connectionConfig.port) || R.isNil(connectionConfig.port) ||
  !Number.isInteger(connectionConfig.port) || connectionConfig.port < 1
    ? errors.push("port is missing or invalid") : errors.push(null);

  R.isEmpty(connectionConfig.remoteFileName) || R.isNil(connectionConfig.remoteFileName) ||
  typeof connectionConfig.remoteFileName !== "string"
    ? errors.push("remoteFileName is missing or invalid") : errors.push(null);

  R.all(R.equals(null))(errors) ? resolve(connectionConfig) : reject(R.reject(R.isNil, errors));

  return () => { };
});

module.exports = {
  createObjectHash,
  createReadStream,
  validateConnectionConfig,
};
