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
      return reject(err);
    });

    client.on("ready", () => {
      client.sftp((err, sftp) => {
        if (err) {
          client.end();
          return reject(err);
        }

        try {
          const sftpStream = sftp.createReadStream(connectionConfig.remoteFilePath);

          sftpStream.on("error", (err) => {
            client.end();
            return reject(err);
          });

          sftpStream.on("close", () => {
            client.end();
          });

          resolve(sftpStream);
        } catch (err) {
          client.end();
          return reject(err);
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
        return reject(err);
      });

      client.on("ready", () => {
        client.sftp((err, sftp) => {
          if (err) {
            client.end();
            return reject(err);
          }

          const writeStream = sftp.createWriteStream(connectionConfig.remoteFilePath);
          writeStream.on("error", (err) => {
            client.end();
            return reject(err);
          });

          writeStream.on("ready", () => {
            readStream.pipe(writeStream);
            return resolve("Upload successful");
          });

          writeStream.on("close", () => {
            client.end();
          });
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
