const chai = require("chai");
const expect = chai.expect;
const Ftp = require("ftp");
const {fork} = require("fluture");
const path = require("path");
const Readable = require("stream").Readable;
const {sendFileViaFtp} = require(path.join(__dirname, "../../../lib/ftp.js"));

const cleanUpFtp = ftpClient => {
  ftpClient.on("ready", () => {
    // todo: figure out why this throws "delete operation failed"
    ftpClient.delete("/some_file.txt", (err) => {}); // eslint-disable-line handle-callback-err
    ftpClient.end();
  });

  ftpClient.on("error", (err) => {
    console.log(err);
  });

  const connectionConfig = {
    "host": "ftps-server",
    "port": 31,
    "remoteFilePath": "/ftp/user/some_file.txt",
    "user": "user",
    "password": "password",
  };

  ftpClient.connect(connectionConfig);
};

describe("SYSTEM TESTS - ftp.js", function() {
  describe("sendFileViaFtp", function() {
    it("should put a file on an ftp server", function(done) {
      this.timeout(5000);

      const connectionConfig = {
        "host": "ftps-server",
        "port": 31,
        "remoteFilePath": "/ftp/user/some_file.txt",
        "user": "user",
        "password": "password",
        "secure": true,
        "secureOptions": {"rejectUnauthorized": false},
      };

      const verifyResults = (ftpClient, data, expected) => {
        expect(data).to.deep.equal("Upload successful");

        let finalVal;

        ftpClient.on("ready", () => {
          ftpClient.get(connectionConfig.remoteFilePath, (err, stream) => {
            if (err) throw err;

            const chunks = [];

            stream.on("data", (chunk) => {
              chunks.push(chunk.toString());
            });

            stream.on("end", () => {
              finalVal = chunks.join("");

              expect(finalVal).to.deep.equal("hello world");
              ftpClient.end();
            });
          });
        });

        ftpClient.connect(connectionConfig);
      };

      const readable = new Readable();

      fork
      (done)
      (data => {
        verifyResults(new Ftp(), data, readable);
        cleanUpFtp(new Ftp());
        done();
      })
      (sendFileViaFtp(new Ftp())(readable)(connectionConfig));

      readable.push("hello world");
      readable.push(null);
    });

    it("should reject if the server throws an error", function(done) {
      this.timeout(5000);

      // we don't allow anonymous login in test container
      const connectionConfig = {
        "host": "ftps-server",
        "port": 31,
        "remoteFilePath": "/ftp/user/some_file.txt",
        "user": "user",
        "password": "password",
        "secure": true,
        "secureOptions": {"rejectUnauthorized": false},
      };

      const readable = new Readable();

      fork
      (err => {
        expect(err).to.deep.equal("read ECONNRESET");
        done();
      })
      (done)
      (sendFileViaFtp(new Ftp())(readable)(connectionConfig));

      readable.push("hello world");
      readable.push(null);
    });
  });
});
