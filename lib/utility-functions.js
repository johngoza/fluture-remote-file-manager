const $ = require("sanctuary-def");
const crypto = require("crypto");
const R = require("ramda");
const {ConnectionConfig, def, ReadStreamType, S} = require("./sanctuary-environment");
const {FutureType} = require("fluture-sanctuary-types");
const {Future} = require("fluture");

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
([$.String, $.Maybe($.Object), $.Either($.String)($.String)])
(existingSignature => fileMetadata => {
  const signature = createObjectHash(S.show(fileMetadata));

  if (R.isEmpty(existingSignature)) {
    return S.Right(signature);
  } else {
    return existingSignature === signature
      ? S.Right(signature)
      : S.Left("File metadata changed while attempting GET. File is not currently viable for consumption");
  };
});

const filterFileMetadata = def("filterFileMetadata")
({})
([ConnectionConfig, $.String, $.Array($.Object), $.Either($.String)($.Maybe($.Object))])
(connectionConfig => nameField => fileList => {
  const remoteDirectory = connectionConfig.remoteDirectory;
  const remoteFileName = connectionConfig.remoteFileName;
  const errorString = "file " + remoteFileName + " not found on remote in directory " + remoteDirectory;

  const filtered = S.find(file => file[nameField] === connectionConfig.remoteFileName) (fileList);
  return S.isNothing(filtered) ? S.Left(errorString) : S.Right(filtered);
});

const rejectOnLeft = def("rejectOnLeft")
({})
([$.Any, FutureType($.Any)($.Any)])
(eitherToCheck => Future((reject, resolve) => {
  S.either(reject)(resolve)(eitherToCheck);

  return () => { };
}));

// this is not defined using sanctuary-def as it would break our ability to test it
// this is intended for runtime checking so having all test cases is important
const validateConnectionConfig = (connectionConfig) => {
  const errors = [];

  R.isEmpty(connectionConfig.host) || R.isNil(connectionConfig.host) || typeof connectionConfig.host !== "string"
    ? errors.push("host is missing or invalid") : errors.push(null);

  R.isEmpty(connectionConfig.port) || R.isNil(connectionConfig.port) ||
  !Number.isInteger(connectionConfig.port) || connectionConfig.port < 1
    ? errors.push("port is missing or invalid") : errors.push(null);

  R.isEmpty(connectionConfig.remoteFileName) || R.isNil(connectionConfig.remoteFileName) ||
  typeof connectionConfig.remoteFileName !== "string"
    ? errors.push("remoteFileName is missing or invalid") : errors.push(null);

  return R.not(R.all(R.equals(null))(errors)) ? S.Left(R.reject(R.isNil, errors)) : S.Right(connectionConfig);
};

module.exports = {
  createObjectHash,
  createReadStream,
  filterFileMetadata,
  rejectOnLeft,
  validateConnectionConfig,
  verifyFileSignature,
};
