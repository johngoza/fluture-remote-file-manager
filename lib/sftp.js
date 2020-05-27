const $ = require("sanctuary-def");
const {FutureType} = require("fluture-sanctuary-types");
const {def, FtpConnectionConfig} = require("./sanctuary-environment");
const {Future} = require("fluture");

// sendFileViaSftp :: String -> FtpConnectionConfig -> Future
const sendFileViaSftp =
    def("sendFileViaSftp")
    ({})
    ([$.Unknown, $.Unknown, FtpConnectionConfig, FutureType($.String)($.String)]) // todo: change this to common log shape once defined
    (client => readStream => connectionConfig => Future((reject, resolve) => {
      client.on("error", (err) => {
        client.end();
        reject(err);
      });

      client.on("ready", () => {
        client.sftp((err, sftp) => {
          if (err) {
            reject(err); // todo: same as above
          }

          // change this to not throw runtime on null
          // lens would pop in undefined
          // change to validate incoming w a lovely reject message
          const writeStream = sftp.createWriteStream(connectionConfig.remoteFilePath);
          writeStream.on("error", (err) => {
            client.end();
            reject(err); // todo: same as above
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
