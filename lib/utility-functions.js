const $ = require("sanctuary-def");
const crypto = require("crypto");
const Future = require("fluture");
const R = require("ramda");
const S = require("sanctuary");
const {def, ReadStreamType, ConnectionConfig} = require("./sanctuary-environment");
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

const verifyFileSignature = def("verifyFileSignature")
({})
([ConnectionConfig, $.Maybe($.Object), FutureType($.String)(ConnectionConfig)])
(connectionConfig => fileMetadata => Future((reject, resolve) => {
  const signature = createObjectHash(S.show(fileMetadata));

  if (connectionConfig.fileSignature != null) {
    connectionConfig.fileSignature === signature
      ? resolve(connectionConfig)
      : reject("File metadata changed while attempting GET. File is not currently viable for consumption");
  } else {
    connectionConfig.fileSignature = signature;
    resolve(connectionConfig);
  };

  return () => { };
}));

const filterFileMetadata = def("filterFileMetadata")
({})
([ConnectionConfig, $.String, $.Array($.Object), FutureType($.String)($.Maybe($.Object))])
(connectionConfig => nameField => fileList => Future((reject, resolve) => {
  const remoteDirectory = connectionConfig.remoteDirectory;
  const remoteFileName = connectionConfig.remoteFileName;

  const filtered = S.find(file => file[nameField] === connectionConfig.remoteFileName) (fileList);
  if (S.isNothing(filtered)) {
    reject("file " + remoteFileName + " not found on remote in directory " + remoteDirectory);
  } else {
    resolve(filtered);
  };

  return () => { };
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
  filterFileMetadata,
  validateConnectionConfig,
  verifyFileSignature,
};
