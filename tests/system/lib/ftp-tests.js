const chai = require("chai");
const expect = chai.expect;
const Ftp = require("ftp");
const path = require("path");
const {fork} = require("fluture");
const {getFile, sendFile} = require(path.join(__dirname, "../../../index"));

// There is a known limitation for vsftpd (ftps); it cannot currently support handle TLSv1.3 (as of 23 SEPT 2020)
// see https://forum.filezilla-project.org/viewtopic.php?t=50598 for more
// if you see something like ERR_SSL_WRONG_VERSION_NUMBER you have modified the TLS settings and will need to revert them
// For the FTPS connection configs, the secureOptions MUST be
//         "secureOptions": {
//           "rejectUnauthorized": false,
//           "minVersion": "TLSv1.2",
//           "maxVersion": "TLSv1.2",
//         },
// anything less explicit than that tests either deprecated methods (TLSv1.1) or unsupported (TLSv1.3)
describe("SYSTEM TESTS - ftp.js", function() {
  describe("getFileViaFtp", function() {
    it("should get a file on an ftp server", function(done) {
      this.timeout(5000);

      // the hello.txt file can be found in /tests/system/resources/ftp
      const connectionConfig = {
        "host": "ftp-server",
        "port": 21,
        "remoteDirectory": "/",
        "remoteFileName": "hello.txt",
        "user": "user",
        "password": "password",
      };

      fork
      (done)
      (data => {
        let result = "";

        data.on("data", function(d) {
          result += d.toString();
        });

        data.on("end", function() {
          expect(result).to.deep.equal("hello world");
          done();
        });
      })
      (getFile("ftp")(connectionConfig));
    });

    it("should reject if the server throws an error", function(done) {
      this.timeout(5000);

      // we don't allow anonymous login in test container
      const connectionConfig = {
        "host": "ftp-server",
        "port": 21,
        "remoteDirectory": "/",
        "remoteFileName": "hello.txt",
        "user": "",
        "password": "",
      };

      fork
      (err => {
        expect(err).to.deep.equal("530 Login incorrect.");
        done();
      })
      (done)
      (getFile("ftp")(connectionConfig));
    });
  });

  describe("sendFileViaFtp", function() {
    // it("should put a file on an ftp server", function(done) {
    //   this.timeout(5000);
    //
    //   const connectionConfig = {
    //     "host": "ftp-server",
    //     "port": 21,
    //     "remoteDirectory": "/ftp/user/",
    //     "remoteFileName": "some_file.txt",
    //     "user": "user",
    //     "password": "password",
    //   };
    //
    //   const verifyResults = (ftpClient, data) => {
    //     expect(data).to.deep.equal("Upload successful");
    //
    //     let finalVal;
    //
    //     ftpClient.on("ready", () => {
    //       ftpClient.get(connectionConfig.remoteFileName, (err, stream) => {
    //         if (err) throw err;
    //
    //         const chunks = [];
    //
    //         stream.on("data", (chunk) => {
    //           chunks.push(chunk.toString());
    //         });
    //
    //         stream.on("end", () => {
    //           finalVal = chunks.join("");
    //
    //           expect(finalVal).to.deep.equal("hello world");
    //           ftpClient.end();
    //         });
    //       });
    //     });
    //
    //     ftpClient.connect(connectionConfig);
    //   };
    //
    //   const filepath = "tests/system/resources/hello.txt";
    //
    //   fork
    //   (done)
    //   (data => {
    //     verifyResults(new Ftp(), data);
    //     done();
    //   })
    //   (sendFile("ftp")(connectionConfig)(filepath));
    // });

    it("should reject if the server throws an error", function(done) {
      this.timeout(5000);

      // we don't allow anonymous login in test container
      const connectionConfig = {
        "host": "ftp-server",
        "port": 21,
        "remoteDirectory": "/ftp/user/",
        "remoteFileName": "some_file.txt",
        "user": "",
        "password": "",
      };

      const filepath = "tests/system/resources/hello.txt";

      fork
      (err => {
        expect(err).to.deep.equal("530 Login incorrect.");
        done();
      })
      (done)
      (sendFile("ftp")(connectionConfig)(filepath));
    });
  });

  // do not modify the secureOptions field for any of the below connection configs. Read note at head of file for more.
  describe("getFileViaFtps", function() {
    it("should get a file on an ftps server", function(done) {
      this.timeout(5000);

      // the hello.txt file can be found in /tests/system/resources/ftp
      const connectionConfig = {
        "host": "ftps-server",
        "port": 21,
        "remoteDirectory": "/user/",
        "remoteFileName": "hello.txt",
        "user": "user",
        "password": "password",
        "secure": true,
        "secureOptions": {
          "rejectUnauthorized": false,
          "minVersion": "TLSv1.2",
          "maxVersion": "TLSv1.2",
        },
      };

      fork
      (done)
      (data => {
        let result = "";

        data.on("data", function(d) {
          result += d.toString();
          data.destroy();
        });

        data.on("end", function() {
          expect(result).to.deep.equal("hello world");
          done();
        });
      })
      (getFile("ftp")(connectionConfig));
    });

    it("should reject if the ftps server throws an error", function(done) {
      this.timeout(5000);

      // no password will fail every time
      const connectionConfig = {
        "host": "ftps-server",
        "port": 21,
        "remoteDirectory": "/user/",
        "remoteFileName": "some_file.txt",
        "user": "user",
        "password": "",
        "secure": true,
        "secureOptions": {
          "rejectUnauthorized": false,
          "minVersion": "TLSv1.2",
          "maxVersion": "TLSv1.2",
        },
      };

      fork
      (err => {
        expect(err).to.deep.equal("530 Login incorrect.");
        done();
      })
      (done)
      (getFile("ftp")(connectionConfig));
    });
  });

  describe("sendFileViaFtps", function() {
    it("should put a file on an ftps server", function(done) {
      this.timeout(5000);

      const connectionConfig = {
        "host": "ftps-server",
        "port": 21,
        "remoteDirectory": "/user/",
        "remoteFileName": "some_file.txt",
        "user": "user",
        "password": "password",
        "secure": true,
        "secureOptions": {
          "rejectUnauthorized": false,
          "minVersion": "TLSv1.2",
          "maxVersion": "TLSv1.2",
        },
      };

      const verifyResults = (data) => {
        let finalVal;
        const ftpClient = new Ftp();

        ftpClient.on("error", (err) => {
          ftpClient.end();
          throw err;
        });

        ftpClient.on("end", () => {
        });

        ftpClient.on("ready", () => {
          ftpClient.get(connectionConfig.remoteFileName, (err, stream) => {
            if (err) {
              ftpClient.end();
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
                ftpClient.end();
                done();
              });
            }
          });
        });

        ftpClient.connect(connectionConfig);
      };

      const filepath = "tests/system/resources/hello.txt";

      fork
      (done)
      (data => {
        verifyResults(data);
      })
      (sendFile("ftp")(connectionConfig)(filepath));
    });

    it("should reject if the ftps server throws an error", function(done) {
      this.timeout(5000);

      // no password will fail every time
      const connectionConfig = {
        "host": "ftps-server",
        "port": 21,
        "remoteDirectory": "/user/",
        "remoteFileName": "some_file.txt",
        "user": "user",
        "password": "",
        "secure": true,
        "secureOptions": {
          "rejectUnauthorized": false,
          "minVersion": "TLSv1.2",
          "maxVersion": "TLSv1.2",
        },
      };

      const filepath = "tests/system/resources/hello.txt";

      fork
      (err => {
        expect(err).to.deep.equal("530 Login incorrect.");
        done();
      })
      (done)
      (sendFile("ftp")(connectionConfig)(filepath));
    });
  });
});
