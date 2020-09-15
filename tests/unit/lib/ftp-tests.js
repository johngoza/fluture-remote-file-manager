const EventEmitter = require("events");
const S = require("sanctuary");
const {
  getFileMetadata,
  filterFileMetadata,
  getFileViaFtp,
  sendFileViaFtp,
  setupConnection,
} = require("../../../lib/ftp.js");
const {expect} = require("chai");
const {Future, fork} = require("fluture");
const {Readable} = require("stream");

describe("Unit Tests - ftp.js", function() {
  describe("getFileViaFtp", function() {
    it("should return a future", function() {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFileName": "",
        "remoteDirectory": "",
        "user": "",
        "password": "",
      };

      const mockFtpClient = new EventEmitter();
      mockFtpClient.connect = (config) => {
        mockFtpClient.emit("ready");
      };
      mockFtpClient.put = () => { };
      mockFtpClient.get = () => {
        return "get failed";
      };
      mockFtpClient.end = () => { };

      expect(getFileViaFtp(mockFtpClient)(mockConnectionConfig)).to.be.instanceOf(Future);
    });

    it("should resolve with a success message if get succeeds", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFileName": "",
        "remoteDirectory": "",
        "user": "",
        "password": "",
      };

      const readable = new Readable();

      const mockFtpClient = new EventEmitter();
      mockFtpClient.connect = (config) => {
        mockFtpClient.emit("ready");
      };
      mockFtpClient.put = () => { };
      mockFtpClient.get = (path, callback) => {
        callback(null, readable);
      };
      mockFtpClient.end = () => { };

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
      (getFileViaFtp(mockFtpClient)(mockConnectionConfig));

      readable.push("hello world");
      readable.push(null);
    });

    it("should reject if get fails", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFileName": "",
        "remoteDirectory": "",
        "user": "",
        "password": "",
      };

      const errorMessage = {"code": "503", "message": "get failed"};

      const mockFtpClient = new EventEmitter();
      mockFtpClient.connect = (config) => {
        mockFtpClient.emit("ready");
      };
      mockFtpClient.put = () => { };
      mockFtpClient.get = (p, cb) => {
        cb(errorMessage, null);
      };
      mockFtpClient.end = () => { };

      fork
      (err => {
        expect(err).to.equal("503 get failed");
        done();
      })
      (done)
      (getFileViaFtp(mockFtpClient)(mockConnectionConfig));
    });

    // todo: this proves the error handling is broken
    it("should reject if the client throws an error during get", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFileName": "",
        "remoteDirectory": "",
        "user": "",
        "password": "",
      };

      const mockFtpClient = new EventEmitter();
      mockFtpClient.connect = (config) => {
        mockFtpClient.emit("ready");
      };
      mockFtpClient.put = () => { };
      mockFtpClient.get = (p, cb) => {
        mockFtpClient.emit("error", {"code": "503", "message": "get failed"});
      };
      mockFtpClient.end = () => { };

      fork
      (err => {
        expect(err).to.equal("503 get failed");
        done();
      })
      (done)
      (getFileViaFtp(mockFtpClient)(mockConnectionConfig));
    });
  });

  describe("getFileMetadata", function() {
    it("should resolve with a list of files in a directory if everything exists", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFileName": "",
        "remoteDirectory": "",
        "user": "",
        "password": "",
      };

      const mockFileList = [
        {
          "name": "hello.txt",
          "size": "0 MB",
        },
      ];

      const mockFtpClient = {
        "list": (dir, cb) => {
          cb(null, mockFileList);
        },
      };

      fork
      (done)
      (data => {
        expect(data).to.deep.equal(mockFileList);
        done();
      })
      (getFileMetadata(mockConnectionConfig)(mockFtpClient));
    });

    it("should reject with an error message if error is returned", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFileName": "",
        "remoteDirectory": "",
        "user": "",
        "password": "",
      };

      const mockError =
        {
          "code": "400",
          "message": "Directory not found",
        };

      const mockFtpClient = {
        "list": (dir, cb) => {
          cb(mockError);
        },
      };
      mockFtpClient.connect = () => { };
      mockFtpClient.get = () => { };
      mockFtpClient.put = () => { };
      mockFtpClient.end = () => { };

      fork
      (err => {
        expect(err).to.deep.equal("400 Directory not found");
        done();
      })
      (done)
      (getFileMetadata(mockConnectionConfig)(mockFtpClient));
    });
  });

  describe("filterFileMetadata", function() {
    it("should resolve with the only the specific file's metadata if present", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFileName": "hello.txt",
        "remoteDirectory": "",
        "user": "",
        "password": "",
      };

      const mockFileList = [
        {
          "name": "hello.txt",
          "size": "1776 KB",
        },
        {
          "name": "other-file.txt",
          "size": "3 MB",
        },
      ];

      const expectedData = S.Just({
        "name": "hello.txt",
        "size": "1776 KB",
      });

      fork
      (done)
      (data => {
        expect(data).to.deep.equal(expectedData);
        done();
      })
      (filterFileMetadata(mockConnectionConfig)(mockFileList));
    });

    it("should reject with descriptive error if file isn't present", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFileName": "hello.txt",
        "remoteDirectory": "/",
        "user": "",
        "password": "",
      };

      const mockFileList = [
        {
          "name": "file.txt",
          "size": "2 KB",
        },
        {
          "name": "other-file.txt",
          "size": "3 MB",
        },
      ];

      const expectedError = "file hello.txt not found on remote in directory /";

      fork
      (err => {
        expect(err).to.deep.equal(expectedError);
        done();
      })
      (done)
      (filterFileMetadata(mockConnectionConfig)(mockFileList));
    });
  });

  describe("sendFileViaFtp", function() {
    it("should return a future", function() {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFileName": "",
        "remoteDirectory": "",
        "user": "",
        "password": "",
      };
      const mockFtpClient = new EventEmitter();
      mockFtpClient.connect = (connectionconfiguration) => {
        mockFtpClient.emit("ready");
      };
      mockFtpClient.on("ready", () => { });
      mockFtpClient.get = () => { };
      mockFtpClient.put = () => {
        return "put failed";
      };
      mockFtpClient.end = () => { };

      expect(sendFileViaFtp(mockFtpClient)(new Readable())(mockConnectionConfig)).to.be.instanceOf(Future);
    });

    it("should resolve with a success message if put succeeds", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFileName": "",
        "remoteDirectory": "",
        "user": "",
        "password": "",
      };

      const mockFtpClient = new EventEmitter();
      mockFtpClient.connect = (connectionconfiguration) => {
        mockFtpClient.emit("ready");
      };
      mockFtpClient.on("ready", () => { });
      mockFtpClient.get = () => { };
      mockFtpClient.put = (file, path, callback) => {
        callback();
      };
      mockFtpClient.end = () => { };

      fork
      (done)
      (result => {
        expect(result).to.equal("Upload successful");
        done();
      })
      (sendFileViaFtp(mockFtpClient)(new Readable())(mockConnectionConfig));
    });

    it("should reject if the client throws an error", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFileName": "",
        "remoteDirectory": "",
        "user": "",
        "password": "",
      };

      const mockFtpClient = new EventEmitter();
      mockFtpClient.connect = (connectionconfiguration) => {
        mockFtpClient.emit("ready");
      };
      mockFtpClient.on("ready", () => { });
      mockFtpClient.get = () => { };
      mockFtpClient.put = (f, p, cb) => {
        mockFtpClient.emit("error", {"code": "503", "message": "put failed"});
      };
      mockFtpClient.end = () => { };

      fork
      (err => {
        expect(err).to.equal("503 put failed");
        done();
      })
      (done)
      (sendFileViaFtp(mockFtpClient)(new Readable())(mockConnectionConfig));
    });

    it("should reject if put fails", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFileName": "",
        "remoteDirectory": "",
        "user": "",
        "password": "",
      };

      const mockedError = {"code": "503", "message": "put failed"};

      const mockFtpClient = new EventEmitter();
      mockFtpClient.connect = (connectionconfiguration) => {
        mockFtpClient.emit("ready");
      };
      mockFtpClient.on("ready", () => { });
      mockFtpClient.get = () => { };
      mockFtpClient.put = (f, p, cb) => {
        cb(mockedError);
      };
      mockFtpClient.end = () => { };

      fork
      (err => {
        expect(err).to.equal("503 put failed");
        done();
      })
      (done)
      (sendFileViaFtp(mockFtpClient)(new Readable())(mockConnectionConfig));
    });
  });

  describe("setupConnection", function() {
    it("should resolve with the ftp client", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFileName": "",
        "remoteDirectory": "",
        "user": "",
        "password": "",
      };

      const mockFtpClient = new EventEmitter();
      mockFtpClient.connect = (connectionConfig) => {
        mockFtpClient.emit("ready");
      };
      mockFtpClient.get = () => { };
      mockFtpClient.put = () => { };
      mockFtpClient.end = () => { };

      fork
      (done)
      (data => {
        expect(data).to.deep.equal(mockFtpClient);
        done();
      })
      (setupConnection(mockFtpClient)(mockConnectionConfig));
    });

    it("should reject if an error is thrown", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFileName": "",
        "remoteDirectory": "",
        "user": "",
        "password": "",
      };

      const mockError = {
        "message": "an error occurred",
        "code": "500",
      };

      const mockFtpClient = new EventEmitter();
      mockFtpClient.connect = (connectionConfig) => {
        mockFtpClient.emit("error", mockError);
      };
      mockFtpClient.get = () => { };
      mockFtpClient.put = () => { };
      mockFtpClient.end = () => { };

      const expectedError = "500 an error occurred";

      fork
      (err => {
        expect(err).to.deep.equal(expectedError);
        done();
      })
      (done)
      (setupConnection(mockFtpClient)(mockConnectionConfig));
    });
  });

  describe("verifyAndGetFile", function() {
    it("should resolve with a readstream", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFileName": "hello.txt",
        "remoteDirectory": "",
        "user": "",
        "password": "",
      };

      const mockFileList = [
        {
          "name": "hello.txt",
          "size": "2 KB",
        },
        {
          "name": "other-file.txt",
          "size": "3 MB",
        },
      ];

      const readable = new Readable();

      const mockFtpClient = new EventEmitter();
      mockFtpClient.connect = (config) => {
        mockFtpClient.emit("ready");
      };
      mockFtpClient.put = () => { };
      mockFtpClient.get = (path, callback) => {
        callback(null, readable);
      };
      mockFtpClient.list = (remoteDirectory, cb) => {
        cb(null, mockFileList);
      };
      mockFtpClient.end = () => { };

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
      (getFileViaFtp(mockFtpClient)(mockConnectionConfig));

      readable.push("hello world");
      readable.push(null);
    });

    it("should reject if an error is encountered on GET", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFileName": "hello.txt",
        "remoteDirectory": "",
        "user": "",
        "password": "",
      };

      const mockFileList = [
        {
          "name": "hello.txt",
          "size": "2 KB",
        },
      ];

      const mockError = {
        "message": "an error occurred",
        "code": "500",
      };

      const mockFtpClient = new EventEmitter();
      mockFtpClient.connect = (config) => {
        mockFtpClient.emit("ready");
      };
      mockFtpClient.put = () => { };
      mockFtpClient.get = (path, callback) => {
        callback(mockError);
      };
      mockFtpClient.list = (remoteDirectory, cb) => {
        cb(null, mockFileList);
      };
      mockFtpClient.end = () => { };

      fork
      (err => {
        expect(err).to.deep.equal("500 an error occurred");
        done();
      })
      (done)
      (getFileViaFtp(mockFtpClient)(mockConnectionConfig));
    });

    // todo: this proves the error handling is broken
    it("should reject if an error is encountered elsewhere", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFileName": "hello.txt",
        "remoteDirectory": "",
        "user": "",
        "password": "",
      };

      const mockFileList = [
        {
          "name": "hello.txt",
          "size": "2 KB",
        },
      ];

      const mockError = {
        "message": "an error occurred",
        "code": "500",
      };

      const readable = new Readable();

      const mockFtpClient = new EventEmitter();
      mockFtpClient.connect = (config) => {
        mockFtpClient.emit("ready");
      };
      mockFtpClient.put = () => { };
      mockFtpClient.get = (path, callback) => {
        callback(null, readable);
      };
      mockFtpClient.list = (remoteDirectory, cb) => {
        mockFtpClient.emit("error", mockError);
      };
      mockFtpClient.end = () => { };

      fork
      (err => {
        expect(err).to.deep.equal("500 an error occurred");
        done();
      })
      (done)
      (getFileViaFtp(mockFtpClient)(mockConnectionConfig));
    });
  });
});
