const EventEmitter = require("events");
const {expect} = require("chai");
const {fork} = require("fluture");
const {forwardToGetMethod, forwardToSendMethod, getFile, sendFile} = require("../../index.js");
const {getFileViaFtp, sendFileViaFtp} = require("../../lib/ftp.js");
const {Readable, PassThrough} = require("stream");
const {sendFileViaEmail} = require("../../lib/email.js");
const {sendFileViaSftp} = require("../../lib/sftp.js");

describe("Integration Tests", function() {
  describe("forwardToGetMethod", function() {
    it("should route to ftp", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFilePath": "file.txt",
        "user": "",
        "password": "",
      };

      const readable = new Readable();
      const passthrough = new PassThrough();

      readable.push("hello world");
      readable.push(null);

      const mockFtpClient = new EventEmitter();
      mockFtpClient.connect = (config) => {
        mockFtpClient.emit("ready");
      };
      mockFtpClient.put = () => { };
      mockFtpClient.get = (path, callback) => {
        callback(null, readable);
      };
      mockFtpClient.end = () => { };

      const mockSendFunctions = {
        "ftp": {
          "method": getFileViaFtp,
          "client": mockFtpClient,
        },
      };

      const forkableFunction = forwardToGetMethod("ftp")(mockConnectionConfig)(mockSendFunctions)(passthrough);

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
      (forkableFunction);
    });
  });

  describe("getFile", function() {
    it("should route to ftp", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFilePath": "file.txt",
        "user": "",
        "password": "",
      };

      const readable = new Readable();
      readable.push("hello world");
      readable.push(null);

      const passthrough = new PassThrough();

      const mockFtpClient = new EventEmitter();
      mockFtpClient.connect = (config) => {
        mockFtpClient.emit("ready");
      };
      mockFtpClient.put = () => { };
      mockFtpClient.get = (path, callback) => {
        callback(null, readable);
      };
      mockFtpClient.end = () => { };

      const forkableFunction = getFile ("ftp") (mockConnectionConfig) (passthrough);

      fork
      (err => {
        // error mean we got to the ftp client successfully
        expect(err).to.deep.equal("ECONNREFUSED connect ECONNREFUSED 127.0.0.1:1");
        done();
      })
      (done)
      (forkableFunction);
    });
  });

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
      mockFtpClient.get = () => { };
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

      const forkableFunction = forwardToSendMethod ("ftp") (mockConnectionConfig) (mockSendFunctions) (readable);

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

      const forkableFunction = forwardToSendMethod ("sftp") (mockConnectionConfig) (mockSendFunctions) (readable);

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

    it("should route to email", function(done) {
      const mockMessage = {
        "to": "",
        "from": "",
        "subject": "",
        "text": "",
      };

      const mockConfig = {
        "host": "",
        "port": 1,
        "remoteFilePath": "",
        "auth": {
          "user": "",
          "pass": "",
        },
        "message": mockMessage,
      };

      const mockTransport = new EventEmitter();
      mockTransport.sendMail = (message, cb) => {
        cb(null, "Upload successful");
      };
      mockTransport.close = () => {};

      const mockEmailClient = {
        "createTransport": (config) => { return mockTransport; },
      };

      const mockSendFunctions = {
        "email": {
          "method": sendFileViaEmail,
          "client": mockEmailClient,
        },
      };

      const forkableFunction = forwardToSendMethod ("email") (mockConfig) (mockSendFunctions) (new Readable());

      fork
      (done)
      (data => {
        expect(data).to.equal("Upload successful");
        done();
      })
      (forkableFunction);
    });

    it("should reject if an unsupported send method string is provided", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFilePath": "file.txt",
        "user": "",
        "password": "",
      };

      const mockSendFunctions = {
        "foo": {
          "method": "method",
          "client": "client",
        },
      };

      const forkableFunction = forwardToSendMethod ("bar") (mockConnectionConfig) (mockSendFunctions) (new Readable());

      fork
      (err => {
        expect(err).to.equal("Send function not available");
        done();
      })
      (data => {
        done("Expected an error but recieved " + data);
      })
      (forkableFunction);
    });
  });

  describe("sendFile", function() {
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

      const forkableFunction = sendFile ("ftp") (mockConnectionConfig) ("tests/unit/resources/hello.txt");

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

      const forkableFunction = sendFile ("sftp") (mockConnectionConfig) ("tests/unit/resources/hello.txt");

      fork
      (err => {
        // error means we got to the sftp client successfully
        expect(err.toString()).to.deep.equal("Error: connect ECONNREFUSED 127.0.0.1:1");
        done();
      })
      (data => {
        done("Data should not be returned; Connection refused expected");
      })
      (forkableFunction);
    });

    it("should route to email", function(done) {
      const mockMessage = {
        "to": "",
        "from": "",
        "subject": "",
        "text": "",
      };

      const mockConfig = {
        "host": "",
        "port": 1,
        "remoteFilePath": "",
        "auth": {
          "user": "",
          "pass": "",
        },
        "message": mockMessage,
      };

      const forkableFunction = sendFile ("email") (mockConfig) ("tests/unit/resources/hello.txt");

      fork
      (err => {
        // error means we got to the mail client successfully
        expect(err.toString()).to.deep.equal("ESOCKET connect ECONNREFUSED 127.0.0.1:1");
        done();
      })
      (done)
      (forkableFunction);
    });
  });
});
