const $ = require("sanctuary-def");
const {def, SftpConnectionConfig, ReadStreamType, SshClientType} = require("./sanctuary-environment");
const {filterFileMetadata, rejectOnLeft, verifyFileSignature} = require("./utility-functions");
const {Future, chain, map, resolve} = require("fluture");
const {FutureType} = require("fluture-sanctuary-types");

const setupConnection = def("setupConnection")
({})
([SshClientType, SftpConnectionConfig, FutureType($.String)($.Any)])
(client => connectionConfig => Future((reject, resolve) => {
  client.on("error", (err) => {
    client.end();
    reject(err);
  });

  client.on("ready", () => {
    resolve(client);
  });

  client.connect(connectionConfig);

  return () => { };
}));

const getFileMetadata = def("getFileMetadata")
({})
([SftpConnectionConfig, SshClientType, FutureType($.String)($.Array($.Object))])
(connectionConfig => client => Future((reject, resolve) => {
  client.sftp((err, sftp) => {
    if (err) {
      client.end();
      reject(err.code.toString() + " " + err.message.toString());
    } else {
      sftp.readdir(connectionConfig.remoteDirectory, function(err, list) {
        if (err) {
          client.end();
          reject(err.code.toString() + " " + err.message.toString());
        } else {
          resolve(list);
        }
      });
    }
  });
  return () => { };
}));

const getFileViaSftp =
  def("getFileViaSftp")
  ({})
  ([SshClientType, SftpConnectionConfig, FutureType($.String)($.Any)])
  (client => connectionConfig => Future((reject, resolve) => {
    client.sftp((err, sftp) => {
      if (err) {
        client.end();
        return reject(err);
      }

      const sftpStream = sftp.createReadStream(connectionConfig.remoteFileName);

      sftpStream.on("error", (err) => {
        client.end();
        return reject(err);
      });

      sftpStream.on("ready", () => {
        resolve(sftpStream);
      });

      sftpStream.on("close", () => {
        client.end();
      });
    });

    return () => { };
  }));

const verifyFile = def("verifyFile")
({})
([SshClientType, $.NonNegativeInteger, $.NonNegativeInteger, SftpConnectionConfig, $.String, FutureType($.String)($.Object)])
(client => currIteration => maxIterations => connectionConfig => fileSignature =>
  (currIteration >= maxIterations)
    ? resolve(connectionConfig)
    : getFileMetadata(connectionConfig)(client)
      .pipe(map (filterFileMetadata(connectionConfig)("filename")))
      .pipe(chain (rejectOnLeft))
      .pipe(map (verifyFileSignature(fileSignature)))
      .pipe(chain (rejectOnLeft))
      .pipe(chain (verifyFile(client)(currIteration + 1)(maxIterations)(connectionConfig))));

const verifyAndGetFileViaSftp = def("verifyAndGetFileViaSftp")
({})
([SshClientType, SftpConnectionConfig, FutureType($.String)(ReadStreamType)])
(client => connectionConfig =>
  setupConnection(client)(connectionConfig) // todo: magic constant is not okay but needs to be included here until next pr
    .pipe(chain (client => verifyFile(client)(0)(3)(connectionConfig)("")))
    .pipe(chain (getFileViaSftp(client))));

const sendFileViaSftp =
    def("sendFileViaSftp")
    ({})
    ([SshClientType, ReadStreamType, SftpConnectionConfig, FutureType($.String)($.String)])
    (client => readStream => connectionConfig => Future((reject, resolve) => {
      client.on("error", (err) => {
        client.end();
        return reject(err);
      });

      client.on("ready", () => {
        client.sftp((err, sftp) => {
          if (err) {
            client.end();
            return reject(err);
          }

          const writeStream = sftp.createWriteStream(connectionConfig.remoteFileName);
          writeStream.on("error", (err) => {
            client.end();
            reject(err);
          });

          writeStream.on("ready", () => {
            readStream.pipe(writeStream);
            resolve("Upload successful");
          });

          writeStream.on("close", () => {
            client.end();
          });
        });
      });

      // todo: probably here too
      client.connect(connectionConfig);
      return () => { };
    }));

module.exports = {
  getFileViaSftp,
  getFileMetadata,
  sendFileViaSftp,
  setupConnection,
  verifyAndGetFileViaSftp,
  verifyFile,
};
