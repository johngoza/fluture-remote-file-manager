const $ = require("sanctuary-def");
const {def, ConnectionConfig, ReadStreamType, SshClientType} = require("./sanctuary-environment");
const {FutureType} = require("fluture-sanctuary-types");
const {Future} = require("fluture");

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
          const sftpStream = sftp.createReadStream(connectionConfig.remoteFilePath);
          resolve(sftpStream);
        } catch (err) {
          reject(err);
        }
      });
    });

    client.connect(connectionConfig);
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
      });

      client.connect(connectionConfig);
      return () => { };
    })
    );

module.exports = {
  getFileViaSftp,
  sendFileViaSftp,
};
