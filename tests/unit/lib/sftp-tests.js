const EventEmitter = require("events");
const {expect} = require("chai");
const {Future, fork} = require("fluture");
const {getFileViaSftp, sendFileViaSftp} = require("../../../lib/sftp.js");
const {Readable, PassThrough} = require("stream");

describe("Unit Tests - sftp.js", function() {
  describe("getFileViaSftp", function() {
    it("should return a future", function() {
      const fakeConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFilePath": "",
        "user": "",
        "password": "",
      };

      // this is required for sanctuary type checking
      const mockSftpClient = {
        "connect": () => {},
        "end": () => {},
        "on": () => {},
        "sftp": () => {},
      };

      expect(getFileViaSftp(mockSftpClient)(fakeConnectionConfig)).to.be.instanceOf(Future);
    });

    it("should resolve with a readstream if 'get' succeeds", function(done) {
      const fakeConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFilePath": "some_file.txt",
        "user": "",
        "password": "",
      };

      const readable = new Readable();
      const mockSftpClient = new EventEmitter();

      const sftp = {
        "createReadStream": (remoteFilePath) => {
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
      (getFileViaSftp(mockSftpClient)(fakeConnectionConfig));

      readable.push("hello world");
      readable.push(null);
    });

    it("should reject if 'get' fails", function(done) {
      const fakeConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFilePath": "some_file.txt",
        "user": "",
        "password": "",
      };

      const readable = new Readable();
      const mockSftpClient = new EventEmitter();

      const sftp = {
        "createReadStream": (remoteFilePath) => {
          readable.emit("error");
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

      fork
      (err => {
        expect(err.toString()).to.deep.equal("Error [ERR_UNHANDLED_ERROR]: Unhandled error. (undefined)");
        done();
      })
      (done)
      (getFileViaSftp(mockSftpClient)(fakeConnectionConfig));

      readable.push("hello world");
      readable.push(null);
    });

    it("should reject if there is an error getting the sftp client", function(done) {
      const fakeConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFilePath": "",
        "user": "",
        "password": "",
      };

      const readable = new Readable();
      readable.push("hello world");
      readable.push(null);

      const mockSftpClient = new EventEmitter();
      const mockError = "Error constructing SFTP";

      mockSftpClient.sftp = (cb) => {
        cb(mockError, null);
      };
      mockSftpClient.connect = () => {
        mockSftpClient.emit("ready");
      };
      mockSftpClient.on("ready", () => {});
      mockSftpClient.end = () => {};

      const verifyResult = err => {
        expect(err).to.equal(mockError);
        done();
      };

      fork
      (verifyResult)
      (done)
      (getFileViaSftp(mockSftpClient)(fakeConnectionConfig));
    });
  });

  describe("sendFileViaSftp", function() {
    it("should return a future", function() {
      const fakeConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFilePath": "",
        "user": "",
        "password": "",
      };

      // this is required for sanctuary type checking
      const mockSftpClient = {
        "connect": () => {},
        "end": () => {},
        "on": () => {},
        "sftp": () => {},
      };

      expect(sendFileViaSftp(mockSftpClient)(new Readable())(fakeConnectionConfig)).to.be.instanceOf(Future);
    });

    it("should resolve with a success message if put succeeds", function(done) {
      const fakeConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFilePath": "some_file.txt",
        "user": "",
        "password": "",
      };

      const readable = new Readable();
      readable.push("hello world");
      readable.push(null);

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

      const verifyResult = result => {
        expect(result).to.equal("Upload successful");
        done();
      };

      fork
      (done)
      (verifyResult)
      (sendFileViaSftp(mockSftpClient)(readable)(fakeConnectionConfig));
      passThrough.emit("close");
    });

    it("should reject if file send fails", function(done) {
      const fakeConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFilePath": "",
        "user": "",
        "password": "",
      };

      const readable = new Readable();
      readable.push("hello world");
      readable.push(null);

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

      const verifyResult = err => {
        expect(err).to.equal("SFTP error");
        done();
      };

      fork
      (verifyResult)
      (done)
      (sendFileViaSftp(mockSftpClient)(readable)(fakeConnectionConfig));
      passThrough.emit("error", "SFTP error");
    });

    it("should reject if there is an error getting the sftp client", function(done) {
      const fakeConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFilePath": "",
        "user": "",
        "password": "",
      };

      const readable = new Readable();
      readable.push("hello world");
      readable.push(null);

      const mockSftpClient = new EventEmitter();
      const mockError = "Error constructing SFTP";

      mockSftpClient.sftp = (cb) => {
        cb(mockError, null);
      };
      mockSftpClient.connect = () => {
        mockSftpClient.emit("ready");
      };
      mockSftpClient.on("ready", () => {});
      mockSftpClient.end = () => {};

      const verifyResult = err => {
        expect(err).to.equal(mockError);
        done();
      };

      fork
      (verifyResult)
      (done)
      (sendFileViaSftp(mockSftpClient)(readable)(fakeConnectionConfig));
    });
  });
});
