const $ = require("sanctuary-def");
const R = require("ramda");
const {def, FtpConnectionConfig, FtpClientType, ReadStreamType} = require("./sanctuary-environment.js");
const {filterFileMetadata, rejectOnLeft, verifyFileSignature} = require("./utility-functions");
const {Future, chain, map} = require("fluture");
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
  client.on("error", (err) => {
    client.end();
    reject(err.code.toString() + " " + err.message.toString());
  });

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

    client.on("error", (err) => {
      client.end();
      reject(err.code.toString() + " " + err.message.toString());
    });

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

// todo: add another loop of list -> filter -> verify here as this is useless rn
const verifyAndGetFileViaFtp = def("verifyAndGetFileViaFtp")
({})
([FtpClientType, FtpConnectionConfig, FutureType($.String)(ReadStreamType)])
(client => connectionConfig => {
  return chain (getFileMetadata(connectionConfig)) (setupConnection(client)(connectionConfig))
    .pipe(map (filterFileMetadata(connectionConfig)("name")))
    .pipe(chain (rejectOnLeft))
    .pipe(map (verifyFileSignature(connectionConfig)))
    .pipe(chain (rejectOnLeft))
    .pipe(chain (getFileViaFtp(client)));
});

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
};
