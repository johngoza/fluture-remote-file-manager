const chai = require("chai");
const expect = chai.expect;
const fs = require("fs");
const path = require("path");
const Readable = require("stream").Readable;
const SftpClient = require("ssh2").Client;
const {fork} = require("fluture");
const {sendFileViaSftp} = require(path.join(__dirname, "../../../lib/sftp.js"));

describe("SYSTEM TESTS - sftp.js", function() {
  describe("sendFileViaSftp", function() {
    it("should put a file on an sftp server that uses password auth", function(done) {
      const connectionConfig = {
        "host": "sftp-server",
        "port": 22,
        "remoteFilePath": "some_file.txt",
        "user": "user",
        "password": "password",
      };

      const readable = new Readable();

      fork
      (err => {
        done(err);
      })
      (data => {
        expect(data).to.deep.equal("Upload successful");
        done();
      })
      (sendFileViaSftp(new SftpClient())(readable)(connectionConfig));

      readable.push("hello world");
      readable.push(null);
    });

    it("should put a file on an sftp server that uses key auth", function(done) {
      const privateKey = fs.readFileSync("tests/system/resources/sftp/host_id_rsa");

      const connectionConfig = {
        "host": "sftp-server",
        "port": 22,
        "remoteFilePath": "some_file.txt",
        "user": "user",
        "privateKey": privateKey,
      };

      const readable = new Readable();

      fork
      (err => {
        done(err);
      })
      (data => {
        expect(data).to.deep.equal("Upload successful");
        done();
      })
      (sendFileViaSftp(new SftpClient())(readable)(connectionConfig));

      readable.push("hello world");
      readable.push(null);
    });

    it("should fail with a descritive message if there is an error", function(done) {
      // anonymous login not allowed in test sftp server
      const connectionConfig = {
        "host": "sftp-server",
        "port": 22,
        "remoteFilePath": "some_file.txt",
        "user": "",
        "password": "",
      };

      const readable = new Readable();

      fork
      (err => {
        expect(err.message).to.contain("All configured authentication methods failed");
        done();
      })
      (done)
      (sendFileViaSftp(new SftpClient())(readable)(connectionConfig));

      readable.push("hello world");
      readable.push(null);
    });
  });
});
