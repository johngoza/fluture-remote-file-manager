const $ = require("sanctuary-def");
const {def, SftpConnectionConfig, ReadStreamType, SshClientType} = require("./sanctuary-environment");
const {FutureType} = require("fluture-sanctuary-types");
const {Future} = require("fluture");

const getFileViaSftp =
  def("getFileViaSftp")
  ({})
  ([SshClientType, SftpConnectionConfig, FutureType($.String)($.Any)])
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

        const sftpStream = sftp.createReadStream(connectionConfig.remoteFilePath);

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
    });

    // todo: invalid username throws uncaught here
    client.connect(connectionConfig);
    return () => { };
  })
  );

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

      // todo: probably here too
      client.connect(connectionConfig);
      return () => { };
    })
    );

module.exports = {
  getFileViaSftp,
  sendFileViaSftp,
};
