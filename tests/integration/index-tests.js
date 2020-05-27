const {expect} = require("chai");
const {fork} = require("fluture");
const {forwardToSendMethod, sendFile} = require("../../index.js");
const {Readable, PassThrough} = require("stream");
const EventEmitter = require("events");
const {sendFileViaFtp} = require("../../lib/ftp.js");
const {sendFileViaSftp} = require("../../lib/sftp.js");

describe("Integration Tests", function() {
  describe("forwardToSendMethod", function() {
    it("should route to ftp", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFilePath": "file.txt",
        "user": "",
        "password": "",
      };

      const mockFtpClient = new EventEmitter();
      mockFtpClient.connect = (connectionconfiguration) => {
        mockFtpClient.emit("ready");
      };
      mockFtpClient.put = (readable, path, callback) => {
        callback();
      };
      mockFtpClient.end = () => { };

      const mockSendFunctions = {
        "ftp": {
          "method": sendFileViaFtp,
          "client": mockFtpClient,
        },
      };

      const readable = new Readable();
      readable.push("hello world");
      readable.push(null);

      const forkableFunction = forwardToSendMethod ("ftp") (readable) (mockConnectionConfig) (mockSendFunctions);

      fork
      (err => {
        done(err);
      })
      (data => {
        expect(data).to.deep.equal("Upload successful");
        done();
      })
      (forkableFunction);
    });

    it("should route to sftp", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFilePath": "file.txt",
        "user": "",
        "password": "",
      };

      const passThrough = new PassThrough();
      const mockSftpClient = new EventEmitter();

      const sftp = {
        "createWriteStream": (remoteFilePath) => {
          return passThrough;
        },
      };

      mockSftpClient.sftp = (cb) => {
        cb(null, sftp);
      };
      mockSftpClient.connect = () => {
        mockSftpClient.emit("ready");
      };
      mockSftpClient.on("ready", () => {});
      mockSftpClient.end = () => {};

      const mockSendFunctions = {
        "sftp": {
          "method": sendFileViaSftp,
          "client": mockSftpClient,
        },
      };

      const readable = new Readable();
      readable.push("hello world");
      readable.push(null);

      const forkableFunction = forwardToSendMethod ("sftp") (readable) (mockConnectionConfig) (mockSendFunctions);

      fork
      (err => {
        done(err);
      })
      (data => {
        expect(data).to.deep.equal("Upload successful");
        done();
      })
      (forkableFunction);

      passThrough.emit("close");
    });
  });

  describe("sendFile", function() {
    it("should send to ftp", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFilePath": "file.txt",
        "user": "",
        "password": "",
      };

      const mockFtpClient = new EventEmitter();
      mockFtpClient.connect = (connectionconfiguration) => {
        mockFtpClient.emit("ready");
      };
      mockFtpClient.put = (readable, path, callback) => {
        callback();
      };
      mockFtpClient.end = () => { };

      const forkableFunction = sendFile ("ftp") ("tests/unit/resources/hello.txt") (mockConnectionConfig);

      fork
      (err => {
        // error mean we got to the ftp client successfully
        expect(err).to.deep.equal("ECONNREFUSED connect ECONNREFUSED 127.0.0.1:1");
        done();
      })
      (data => {
        done("Data should not be returned; Connection refused expected");
      })
      (forkableFunction);
    });

    it("should route to sftp", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFilePath": "file.txt",
        "user": "",
        "password": "",
      };

      const forkableFunction = sendFile ("sftp") ("tests/unit/resources/hello.txt") (mockConnectionConfig);

      fork
      (err => {
        // error mean we got to the ftp client successfully
        expect(err.toString()).to.deep.equal("Error: connect ECONNREFUSED 127.0.0.1:1");
        done();
      })
      (data => {
        done("Data should not be returned; Connection refused expected");
      })
      (forkableFunction);
    });
  });
});
