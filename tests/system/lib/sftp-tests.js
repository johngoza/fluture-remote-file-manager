const chai = require("chai");
const expect = chai.expect;
const fs = require("fs");
const path = require("path");
const Readable = require("stream").Readable;
const SftpClient = require("ssh2").Client;
const {fork} = require("fluture");
const {getFile} = require(path.join(__dirname, "../../../index.js"));
const {sendFileViaSftp} = require(path.join(__dirname, "../../../lib/sftp.js"));

// todo: update existing tests to use index functions rather than directly reference the library

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

    it("should fail with a descriptive message if there is an error", function(done) {
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

  describe("getFile", function() {
    it("should get a file on an sftp server that uses password auth", function(done) {
      const connectionConfig = {
        "host": "sftp-server",
        "port": 22,
        "remoteFilePath": "hello.txt",
        "user": "user",
        "password": "password",
      };

      fork
      (err => {
        done(err);
      })
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
      (getFile("sftp")(connectionConfig));
    });

    it("should get a file on an sftp server that uses key auth", function(done) {
      const privateKey = fs.readFileSync("tests/system/resources/sftp/host_id_rsa");

      const connectionConfig = {
        "host": "sftp-server",
        "port": 22,
        "remoteFilePath": "hello.txt",
        "user": "user",
        "privateKey": privateKey,
      };

      fork
      (err => {
        done(err);
      })
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
      (getFile("sftp")(connectionConfig));
    });

    it("should fail with a descriptive message if there is an error", function(done) {
      // anonymous login not allowed in test sftp server
      const connectionConfig = {
        "host": "sftp-server",
        "port": 22,
        "remoteFilePath": "some_file.txt",
        "user": "",
        "password": "",
      };

      fork
      (err => {
        expect(err.message).to.contain("All configured authentication methods failed");
        done();
      })
      (done)
      (getFile("sftp")(connectionConfig));
    });
  });
});
