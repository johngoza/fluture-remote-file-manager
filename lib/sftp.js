const $ = require("sanctuary-def");
const {FutureType} = require("fluture-sanctuary-types");
const {def, ConnectionConfig, ReadStreamType, SshClientType} = require("./sanctuary-environment");
const {Future} = require("fluture");

// sendFileViaSftp :: String -> ConnectionConfig -> Future
const sendFileViaSftp =
    def("sendFileViaSftp")
    ({})
    ([SshClientType, ReadStreamType, ConnectionConfig, FutureType($.String)($.String)])
    (client => readStream => connectionConfig => Future((reject, resolve) => {
      client.on("error", (err) => {
        client.end();
        reject(err);
      });

      client.on("ready", () => {
        client.sftp((err, sftp) => {
          if (err) {
            reject(err);
          }

          const writeStream = sftp.createWriteStream(connectionConfig.remoteFilePath);
          writeStream.on("error", (err) => {
            client.end();
            reject(err);
          });
          writeStream.on("close", () => {
            client.end();
            resolve("Upload successful");
          });

          readStream.pipe(writeStream);
        });
      }).connect(connectionConfig);
      return () => { };
    })
    );

module.exports = {
  sendFileViaSftp,
};
