const chai = require("chai");
const expect = chai.expect;
const SftpClient = require("ssh2").Client;
const {fork} = require("fluture");
const path = require("path");
const Readable = require("stream").Readable;
const {sendFileViaSftp} = require(path.join(__dirname, "../../../lib/sftp.js"));

const cleanUpSftp = (connectionConfig) => {
  const client = new SftpClient();

  client.on("error", (err) => {
    console.log("an error occurred while connecting to sftp client for file cleanup");
    throw err;
  });

  client.on("ready", () => {
    client.sftp((err, sftp) => {
      if (err) {
        client.end();
        throw err;
      }

      sftp.unlink(connectionConfig.remoteFilePath, (err) => {
        client.end();
        throw err;
      });
      client.end();
    });
  }).connect(connectionConfig);
};

describe("SYSTEM TESTS - sftp.js", function() {
  describe("sendFileViaSftp", function() {
    it("should put a file on an sftp server", function(done) {
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

    after(function(done) {
      const connectionConfig = {
        "host": "sftp-server",
        "port": 22,
        "remoteFilePath": "some_file.txt",
        "user": "user",
        "password": "password",
      };

      try {
        cleanUpSftp(connectionConfig);
        done();
      } catch (err) {
        console.log("an error occurred in the after function");
        console.log(err);
        done(err);
      }
    });
  });
});
