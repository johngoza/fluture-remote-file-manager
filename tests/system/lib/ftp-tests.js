const chai = require("chai");
const expect = chai.expect;
const Ftp = require("ftp");
const {fork} = require("fluture");
const Readable = require("stream").Readable;
const {sendFileViaFtp} = require("../../../lib/ftp.js");

describe("SYSTEM TESTS - ftp.js", function() {
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
});