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

// this does not need to return a future. Could return an Either
// can split into generateHash and compareFileSignature functions
const verifyFileSignature = def("verifyFileSignature")
({})
([ConnectionConfig, $.Maybe($.Object), $.Either($.String)(ConnectionConfig)])
(connectionConfig => fileMetadata => {
  const signature = createObjectHash(S.show(fileMetadata));

  const fileSignatureLens = R.lensProp("fileSignature");
  if (R.isNil(R.view(fileSignatureLens, connectionConfig))) {
    return S.Right(R.set(fileSignatureLens, signature, connectionConfig));
  } else {
    return connectionConfig.fileSignature === signature
      ? S.Right(connectionConfig)
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

// todo: this is throwing type errors if the first $.Any is $.Either($.Any)($.Any) (which should work)
const rejectOnLeft = def("rejectOnLeft")
({})
([$.Any, $.Any])
(eitherToCheck => Future((reject, resolve) => {
  S.either(reject)(resolve)(eitherToCheck);

  return () => { };
}));

// const rejectOnLeft = eitherToCheck => {
//   return map (S.either(reject)(R.identity))(eitherToCheck);
// };

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
