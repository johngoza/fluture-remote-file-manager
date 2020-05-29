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
    ftpClient.end();
    console.log("an error occurred in the after function");
    console.log(err);
    throw err;
  });

  const connectionConfig = {
    "host": "ftps-server",
    "port": 21,
    "user": "user",
    "password": "password",
    "secure": true,
    "secureOptions": {"rejectUnauthorized": false},
  };

  ftpClient.connect(connectionConfig);
};

describe("SYSTEM TESTS - ftps.js", function() {
  describe("sendFileViaFtps", function() {
    it("should put a file on an ftps server", function(done) {
      this.timeout(5000);

      const connectionConfig = {
        "host": "ftps-server",
        "port": 21,
        "remoteFilePath": "/some_file.txt",
        "user": "user",
        "password": "password",
        "secure": true,
        "secureOptions": {"rejectUnauthorized": false},
      };

      const verifyResults = (data) => {
        let finalVal;
        const ftpClient = new Ftp();

        ftpClient.on("error", (err) => {
          throw err;
        });

        ftpClient.on("end", () => {
        });

        ftpClient.on("ready", () => {
          ftpClient.get(connectionConfig.remoteFilePath, (err, stream) => {
            if (err) {
              done(err);
            } else {
              const chunks = [];

              stream.on("data", (chunk) => {
                chunks.push(chunk.toString());
                stream.destroy();
              });

              stream.on("end", () => {
                finalVal = chunks.join("");

                expect(finalVal).to.deep.equal("hello world");
                ftpClient.destroy();
                done();
              });
            }
          });
        });

        ftpClient.connect(connectionConfig);
      };

      const readable = new Readable();

      fork
      (done)
      (data => {
        verifyResults(data);
      })
      (sendFileViaFtp(new Ftp())(readable)(connectionConfig));

      readable.push("hello world");
      readable.push(null);
      readable.destroy();
      cleanUpFtp(new Ftp());
    });

    it("should reject if the ftps server throws an error", function(done) {
      this.timeout(5000);

      // no password will fail every time
      const connectionConfig = {
        "host": "ftps-server",
        "port": 21,
        "remoteFilePath": "/some_file.txt",
        "user": "user",
        "password": "",
        "secure": true,
        "secureOptions": {"rejectUnauthorized": false},
      };

      const readable = new Readable();

      fork
      (err => {
        expect(err).to.deep.equal("530 Login incorrect.");
        done();
      })
      (done)
      (sendFileViaFtp(new Ftp())(readable)(connectionConfig));

      readable.push("hello world");
      readable.push(null);
    });
  });
});
