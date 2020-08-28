const chai = require("chai");
const expect = chai.expect;
const fs = require("fs");
const Ftp = require("ftp");
const path = require("path");
const Readable = require("stream").Readable;
const {fork} = require("fluture");
const {getFileViaFtp, sendFileViaFtp} = require(path.join(__dirname, "../../../lib/ftp.js"));

describe("SYSTEM TESTS - ftp.js", function() {
  describe("getFileViaFtp", function() {
    // todo: this ain't workin. fix the durn thing
    it("should get a file on an ftp server", function(done) {
      this.timeout(5000);

      const connectionConfig = {
        "host": "ftp-server",
        "port": 21,
        "remoteFilePath": "/hello.txt",
        "user": "user",
        "password": "password",
      };

      const writable = fs.createWriteStream("my-file.txt");

      fork
      (done)
      (data => {
        const result = fs.readFileSync("my-file.txt", "utf-8");
        console.log(result);
        done();
      })
      (getFileViaFtp(new Ftp())(writable)(connectionConfig));
    });

    // it("should reject if the server throws an error", function(done) {
    //   this.timeout(5000);
    //
    //   // we don't allow anonymous login in test container
    //   const connectionConfig = {
    //     "host": "ftp-server",
    //     "port": 21,
    //     "remoteFilePath": "/ftp/user/some_file.txt",
    //     "user": "",
    //     "password": "",
    //   };
    //
    //   const readable = new Readable();
    //
    //   fork
    //   (err => {
    //     expect(err).to.deep.equal("530 Login incorrect.");
    //     done();
    //   })
    //   (done)
    //   (getFileViaFtp(new Ftp())(readable)(connectionConfig));
    //
    //   readable.push("hello world");
    //   readable.push(null);
    // });
  });

  describe("sendFileViaFtp", function() {
    it("should put a file on an ftp server", function(done) {
      this.timeout(5000);

      const connectionConfig = {
        "host": "ftp-server",
        "port": 21,
        "remoteFilePath": "/ftp/user/some_file.txt",
        "user": "user",
        "password": "password",
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
        "host": "ftp-server",
        "port": 21,
        "remoteFilePath": "/ftp/user/some_file.txt",
        "user": "",
        "password": "",
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

  describe("sendFileViaFtps", function() {
    it("should put a file on an ftps server", function(done) {
      this.timeout(5000);

      const connectionConfig = {
        "host": "ftps-server",
        "port": 21,
        "remoteFilePath": "/user/some_file.txt",
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
    });

    it("should reject if the ftps server throws an error", function(done) {
      this.timeout(5000);

      // no password will fail every time
      const connectionConfig = {
        "host": "ftps-server",
        "port": 21,
        "remoteFilePath": "/user/some_file.txt",
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
