const $ = require("sanctuary-def");
const R = require("ramda");
const {def, FtpConnectionConfig, FtpClientType, ReadStreamType} = require("./sanctuary-environment");
const {filterFileMetadata, rejectOnLeft, verifyFileSignature} = require("./utility-functions");
const {Future, chain, map, resolve} = require("fluture");
const {FutureType} = require("fluture-sanctuary-types");

const setupConnection = def("setupConnection")
({})
([FtpClientType, FtpConnectionConfig, FutureType($.String)($.Any)])
(client => connectionConfig => Future((reject, resolve) => {
  client.on("error", (err) => {
    client.end();
    reject(err.code.toString() + " " + err.message.toString());
  });

  client.on("ready", function() {
    resolve(client);
  });

  client.connect(connectionConfig);

  return () => { };
}));

const getFileMetadata = def("getFileMetadata")
({})
([FtpConnectionConfig, FtpClientType, FutureType($.String)($.Array($.Object))])
(connectionConfig => client => Future((reject, resolve) => {
  client.list(connectionConfig.remoteDirectory, function(err, list) {
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
  (client => connectionConfig => Future((reject, resolve) => {
    const remoteDirectory = connectionConfig.remoteDirectory;
    const remoteFileName = connectionConfig.remoteFileName;
    const remotePath = remoteDirectory + remoteFileName;

    client.get(remotePath, function(err, stream) {
      if (err) {
        client.end();
        reject(err.code.toString() + " " + err.message.toString());
      } else {
        stream.once("close", function() {
          client.end();
        });

        resolve(stream);
      };
    });
    return () => { };
  }));

const verifyFile = def("verifyFile")
({})
([FtpClientType, $.NonNegativeInteger, $.NonNegativeInteger, FtpConnectionConfig, $.String, FutureType($.String)($.Object)])
(client => currIteration => maxIterations => connectionConfig => fileSignature =>
  (currIteration >= maxIterations)
    ? resolve(connectionConfig)
    : getFileMetadata(connectionConfig)(client)
      .pipe(map (filterFileMetadata(connectionConfig)("name")))
      .pipe(chain (rejectOnLeft))
      .pipe(map (verifyFileSignature(fileSignature)))
      .pipe(chain (rejectOnLeft))
      .pipe(chain (verifyFile(client)(currIteration + 1)(maxIterations)(connectionConfig))));

const verifyAndGetFileViaFtp = def("verifyAndGetFileViaFtp")
({})
([FtpClientType, FtpConnectionConfig, FutureType($.String)(ReadStreamType)])
(client => connectionConfig =>
  setupConnection(client)(connectionConfig) // todo: magic constant is not okay but needs to be included here until next pr
    .pipe(chain (client => verifyFile(client)(0)(3)(connectionConfig)("")))
    .pipe(chain (getFileViaFtp(client))));

const sendFileViaFtp =
  def("sendFileViaFtp")
  ({})
  ([FtpClientType, ReadStreamType, FtpConnectionConfig, FutureType($.String)($.String)])
  (client => readStream => connectionConfig => Future((reject, resolve) => {
    const remotePath = connectionConfig.remoteFileName;

    client.on("ready", () => {
      client.put(readStream, remotePath, (err) => {
        client.end();
        R.isNil(err)
          ? resolve("Upload successful")
          : reject(err.code.toString() + " " + err.message.toString());
      });
    });

    client.on("error", (err) => {
      client.end();
      reject(err.code.toString() + " " + err.message.toString());
    });

    client.connect(connectionConfig);

    return () => { };
  }));

module.exports = {
  getFileViaFtp,
  getFileMetadata,
  sendFileViaFtp,
  setupConnection,
  verifyAndGetFileViaFtp,
  verifyFile,
};
