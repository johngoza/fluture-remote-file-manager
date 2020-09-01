const $ = require("sanctuary-def");
const {def, ConnectionConfig, ReadStreamType, SshClientType} = require("./sanctuary-environment");
const {Future} = require("fluture");
const {FutureType} = require("fluture-sanctuary-types");

const getFileViaSftp =
  def("getFileViaSftp")
  ({})
  ([SshClientType, ConnectionConfig, FutureType($.String)($.Any)])
  (client => connectionConfig => Future((reject, resolve) => {
    client.on("error", (err) => {
      client.end();
      reject(err);
    });

    client.on("ready", () => {
      client.sftp((err, sftp) => {
        if (err) {
          client.end();
          return reject(err);
        }

        try {
          resolve(sftp.createReadStream(connectionConfig.remoteFilePath));
        } catch (err) {
          reject(err);
        }
      });
    }).connect(connectionConfig);
    return () => { };
  })
  );

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
            client.end();
            reject(err);
            return;
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
  getFileViaSftp,
  sendFileViaSftp,
};
