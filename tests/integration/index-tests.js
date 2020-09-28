const EventEmitter = require("events");
const {expect} = require("chai");
const {fork} = require("fluture");
const {forwardToGetMethod, forwardToSendMethod, getFile, sendFile} = require("../../index");
const {getFileViaFtp, sendFileViaFtp} = require("../../lib/ftp");
const {getFileViaSftp, sendFileViaSftp} = require("../../lib/sftp");
const {Readable, PassThrough} = require("stream");
const {sendFileViaEmail} = require("../../lib/email");

describe("Integration Tests", function() {
  describe("forwardToGetMethod", function() {
    it("should reject if the desired get method is not defined", function(done) {
      const mockConnectionConfig = {
        "host": "hostname",
        "port": 1,
        "remoteFileName": "file.txt",
        "remoteDirectory": "",
        "user": "",
        "password": "",
      };

      const mockFtpClient = new EventEmitter();
      mockFtpClient.connect = () => { };
      mockFtpClient.put = () => { };
      mockFtpClient.get = () => { };
      mockFtpClient.end = () => { };

      const mockGetFunctions = {
        "ftp": {
          "method": getFileViaFtp,
          "client": mockFtpClient,
        },
      };

      fork
      (err => {
        expect(err).to.deep.equal("Get function not available");
        done();
      })
      (done)
      (forwardToGetMethod("some-get-method")(mockGetFunctions)(mockConnectionConfig));
    });

    it("should route to ftp", function(done) {
      const mockConnectionConfig = {
        "host": "hostname",
        "port": 1,
        "remoteFileName": "file.txt",
        "remoteDirectory": "",
        "user": "",
        "password": "",
      };

      const readable = new Readable();

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
      mockFtpClient.list = () => { };
      mockFtpClient.end = () => { };

      const mockGetFunctions = {
        "ftp": {
          "method": getFileViaFtp,
          "client": mockFtpClient,
        },
      };

      const validateResult = data => {
        let result = "";

        data.on("data", function(d) {
          result += d.toString();
        });

        data.on("end", function() {
          expect(result).to.deep.equal("hello world");
          done();
        });
      };

      fork
      (err => {
        done(err);
      })
      (validateResult)
      (forwardToGetMethod("ftp")(mockGetFunctions)(mockConnectionConfig));
    });

    it("should route to sftp", function(done) {
      const mockConnectionConfig = {
        "host": "hostname",
        "port": 1,
        "remoteFileName": "file.txt",
        "remoteDirectory": "",
        "user": "",
        "password": "",
      };

      const readable = new Readable();
      const mockSftpClient = new EventEmitter();

      const sftp = {
        "createReadStream": (remoteFileName) => {
          return readable;
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

      const mockGetFunctions = {
        "sftp": {
          "method": getFileViaSftp,
          "client": mockSftpClient,
        },
      };

      const validateResult = data => {
        let result = "";

        data.on("data", function(d) {
          result += d.toString();
        });

        data.on("end", function() {
          expect(result).to.deep.equal("hello world");
          done();
        });
      };

      fork
      (done)
      (validateResult)
      (forwardToGetMethod("sftp")(mockGetFunctions)(mockConnectionConfig));

      readable.emit("ready");
      readable.push("hello world");
      readable.push(null);
    });
  });

  describe("getFile", function() {
    it("should reject is the connectionConfig is invalid", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFileName": "",
      };

      const expectedResult = ["host is missing or invalid", "remoteFileName is missing or invalid"];

      fork
      (err => {
        expect(err).to.deep.equal(expectedResult);
        done();
      })
      (done)
      (getFile ("ftp") (mockConnectionConfig));
    });

    it("should route to ftp", function(done) {
      const mockConnectionConfig = {
        "host": "localhost",
        "port": 1,
        "remoteFileName": "file.txt",
        "remoteDirectory": "",
        "user": "",
        "password": "",
      };

      fork
      (err => {
        // error mean we got to the ftp client successfully
        expect(err).to.deep.equal("ECONNREFUSED connect ECONNREFUSED 127.0.0.1:1");
        done();
      })
      (done)
      (getFile ("ftp") (mockConnectionConfig));
    });

    it("should route to sftp", function(done) {
      const mockConnectionConfig = {
        "host": "localhost",
        "port": 1,
        "remoteFileName": "file.txt",
        "remoteDirectory": "",
        "user": "user",
      };

      fork
      (err => {
        // error mean we got to the ftp client successfully
        expect(err.toString()).to.deep.equal("Error: connect ECONNREFUSED 127.0.0.1:1");
        done();
      })
      (done)
      (getFile ("sftp") (mockConnectionConfig));
    });
  });

  describe("forwardToSendMethod", function() {
    it("should reject if the desired send method is not defined", function(done) {
      const mockConnectionConfig = {
        "host": "hostname",
        "port": 1,
        "remoteFileName": "file.txt",
      };

      const mockSendFunctions = {
        "ftp": {
          "method": getFileViaFtp,
          "client": {},
        },
      };

      fork
      (err => {
        expect(err).to.deep.equal("Send function not available");
        done();
      })
      (done)
      (forwardToSendMethod("some-send-method") (mockSendFunctions) (mockConnectionConfig) (new Readable()));
    });

    it("should route to ftp", function(done) {
      const mockConnectionConfig = {
        "host": "hostname",
        "port": 1,
        "remoteFileName": "file.txt",
        "remoteDirectory": "",
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
      mockFtpClient.list = () => { };
      mockFtpClient.end = () => { };

      const mockSendFunctions = {
        "ftp": {
          "method": sendFileViaFtp,
          "client": mockFtpClient,
        },
      };

      const readable = new Readable();
      readable.push(null);

      fork
      (err => {
        done(err);
      })
      (data => {
        expect(data).to.deep.equal("Upload successful");
        done();
      })
      (forwardToSendMethod ("ftp") (mockSendFunctions) (mockConnectionConfig) (readable));
    });

    it("should route to sftp", function(done) {
      const mockConnectionConfig = {
        "host": "hostname",
        "port": 1,
        "remoteFileName": "file.txt",
        "remoteDirectory": "",
      };

      const passThrough = new PassThrough();
      const mockSftpClient = new EventEmitter();

      const sftp = {
        "createWriteStream": (remoteFileName) => {
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

      fork
      (err => {
        done(err);
      })
      (data => {
        expect(data).to.deep.equal("Upload successful");
        done();
      })
      (forwardToSendMethod ("sftp") (mockSendFunctions) (mockConnectionConfig) (readable));

      passThrough.emit("ready");
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
        "remoteFileName": "",
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

      fork
      (done)
      (data => {
        expect(data).to.equal("Upload successful");
        done();
      })
      (forwardToSendMethod ("email") (mockSendFunctions) (mockConfig) (new Readable()));
    });
  });

  describe("sendFile", function() {
    it("should reject is the connectionConfig is invalid", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFileName": "",
      };

      const expectedResult = ["host is missing or invalid", "remoteFileName is missing or invalid"];

      fork
      (err => {
        expect(err).to.deep.equal(expectedResult);
        done();
      })
      (done)
      (sendFile ("ftp") (mockConnectionConfig) ("tests/unit/resources/hello.txt"));
    });

    it("should route to ftp", function(done) {
      const mockConnectionConfig = {
        "host": "localhost",
        "port": 1,
        "remoteFileName": "file.txt",
        "remoteDirectory": "",
        "user": "",
        "password": "",
      };

      fork
      (err => {
        // error mean we got to the ftp client successfully
        expect(err).to.deep.equal("ECONNREFUSED connect ECONNREFUSED 127.0.0.1:1");
        done();
      })
      (data => {
        done("Data should not be returned; Connection refused expected");
      })
      (sendFile ("ftp") (mockConnectionConfig) ("tests/unit/resources/hello.txt"));
    });

    it("should route to sftp", function(done) {
      const mockConnectionConfig = {
        "host": "localhost",
        "port": 1,
        "remoteFileName": "file.txt",
        "remoteDirectory": "",
        "user": "user",
      };

      fork
      (err => {
        // error means we got to the sftp client successfully
        expect(err.toString()).to.deep.equal("Error: connect ECONNREFUSED 127.0.0.1:1");
        done();
      })
      (data => {
        done("Data should not be returned; Connection refused expected");
      })
      (sendFile ("sftp") (mockConnectionConfig) ("tests/unit/resources/hello.txt"));
    });

    it("should route to email", function(done) {
      const mockMessage = {
        "to": "",
        "from": "",
        "subject": "",
        "text": "",
        "content": "hello",
      };

      const mockConfig = {
        "host": "localhost",
        "port": 1,
        "remoteFileName": "pathtofile",
        "auth": {
          "user": "",
          "pass": "",
        },
        "message": mockMessage,
      };

      fork
      (err => {
        // error means we got to the mail client successfully
        expect(err.toString()).to.deep.equal("ESOCKET connect ECONNREFUSED 127.0.0.1:1");
        done();
      })
      (done)
      (sendFile ("email") (mockConfig) ("tests/unit/resources/hello.txt"));
    });
  });
});
