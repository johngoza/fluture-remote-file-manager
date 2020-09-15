const $ = require("sanctuary-def");
const R = require("ramda");
const S = require("sanctuary");
const {createObjectHash} = require("./utility-functions");
const {def, FtpConnectionConfig, FtpClientType, ReadStreamType} = require("./sanctuary-environment");
const {Future, chain} = require("fluture");
const {FutureType} = require("fluture-sanctuary-types");

const setupConnection = def("setupConnection")
({})
([FtpClientType, FtpConnectionConfig, FutureType($.String)($.Any)])
(ftpClient => connectionConfig => Future((reject, resolve) => {
  ftpClient.on("error", (err) => {
    ftpClient.end();
    reject(err.code.toString() + " " + err.message.toString());
  });

  ftpClient.on("ready", function() {
    resolve(ftpClient);
  });

  ftpClient.connect(connectionConfig);

  return () => { };
}));

const verifyFileSignature = def("verifyFileSignature")
({})
([FtpConnectionConfig, $.Object, FutureType($.String)(FtpConnectionConfig)])
(connectionConfig => fileMetadata => Future((reject, resolve) => {
  const signature = createObjectHash(fileMetadata);

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
([FtpConnectionConfig, $.Array($.Object), FutureType($.String)($.Maybe($.Object))])
(connectionConfig => fileList => Future((reject, resolve) => {
  const remoteDirectory = connectionConfig.remoteDirectory;
  const remoteFileName = connectionConfig.remoteFileName;

  const filtered = S.find(file => file.name === connectionConfig.remoteFileName) (fileList);
  if (S.isNothing(filtered)) {
    reject("file " + remoteFileName + " not found on remote in directory " + remoteDirectory);
  } else {
    resolve(filtered);
  };

  return () => { };
}));

const getFileMetadata = def("getFileMetadata")
({})
([FtpConnectionConfig, FtpClientType, FutureType($.String)($.Array($.Object))])
(connectionConfig => ftpClient => Future((reject, resolve) => {
  ftpClient.list(connectionConfig.remoteDirectory, function(err, list) {
    if (err) {
      reject(err.code.toString() + " " + err.message.toString());
    } else {
      resolve(list);
    };
  });

  return () => { };
}));

const getFileViaFtp =
  def("getFileViaFtp")
  ({})
  ([FtpClientType, FtpConnectionConfig, FutureType($.String)($.Void)])
  (ftpClient => connectionConfig => Future((reject, resolve) => {
    const remoteDirectory = connectionConfig.remoteDirectory;
    const remoteFileName = connectionConfig.remoteFileName;
    const remotePath = remoteDirectory + remoteFileName;

    ftpClient.get(remotePath, function(err, stream) {
      if (err) {
        ftpClient.end();
        reject(err.code.toString() + " " + err.message.toString());
      } else {
        stream.once("close", function() {
          console.log("getting!");
          ftpClient.end();
          console.log("this should end!");
        });

        resolve(stream);
      };
    });
    return () => { };
  }));

const verifyAndGetFile = def("verifyAndGetFile")
({})
([FtpClientType, FtpConnectionConfig, FutureType($.String)(ReadStreamType)])
(ftpClient => connectionConfig => {
  return chain (getFileMetadata(connectionConfig)) (setupConnection(ftpClient)(connectionConfig))
    .pipe(chain (filterFileMetadata (connectionConfig)))
    .pipe(chain (verifyFileSignature(connectionConfig)))
    .pipe(chain (getFileViaFtp(ftpClient)));
});

const sendFileViaFtp =
  def("sendFileViaFtp")
  ({})
  ([FtpClientType, ReadStreamType, FtpConnectionConfig, FutureType($.String)($.String)])
  (ftpClient => readStream => connectionConfig => Future((reject, resolve) => {
    const remotePath = connectionConfig.remoteFileName;

    ftpClient.on("ready", () => {
      ftpClient.put(readStream, remotePath, (err) => {
        ftpClient.end();
        R.isNil(err)
          ? resolve("Upload successful")
          : reject(err.code.toString() + " " + err.message.toString());
      });
    });

    ftpClient.on("error", (err) => {
      ftpClient.end();
      reject(err.code.toString() + " " + err.message.toString());
    });

    ftpClient.connect(connectionConfig);

    return () => { };
  }));

module.exports = {
  getFileViaFtp,
  getFileMetadata,
  filterFileMetadata,
  sendFileViaFtp,
  setupConnection,
  verifyAndGetFile,
  verifyFileSignature,
};
