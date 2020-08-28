const EventEmitter = require("events");
const Future = require("fluture");
const {expect} = require("chai");
const {getFileViaFtp, sendFileViaFtp} = require("../../../lib/ftp.js");
const {fork} = Future;
const {Readable, Writable} = require("stream");

describe("Unit Tests - FTP", function() {
  describe("getFileViaFtp", function() {
    it("should return a future", function() {
      const fakeConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFilePath": "",
        "user": "",
        "password": "",
      };

      const mockFtpClient = new EventEmitter();
      mockFtpClient.connect = (connectionconfiguration) => {
        mockFtpClient.emit("ready");
      };
      mockFtpClient.on("ready", () => { });
      mockFtpClient.put = () => { };
      mockFtpClient.get = () => {
        return "get failed";
      };
      mockFtpClient.end = () => { };

      expect(getFileViaFtp(mockFtpClient)(new Writable())(fakeConnectionConfig)).to.be.instanceOf(Future);
    });

    it("should resolve with a success message if get succeeds", function(done) {
      const fakeConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFilePath": "",
        "user": "",
        "password": "",
      };

      const readable = new Readable();
      const writable = new Writable();

      const mockFtpClient = new EventEmitter();
      mockFtpClient.connect = (connectionconfiguration) => {
        mockFtpClient.emit("ready");
      };
      mockFtpClient.on("ready", () => { });
      mockFtpClient.put = () => { };
      mockFtpClient.get = (path, callback) => {
        callback(null, readable);
      };
      mockFtpClient.end = () => { };

      fork
      (done)
      (result => {
        expect(result).to.equal("Upload successful");
        done();
      })
      (getFileViaFtp(mockFtpClient)(writable)(fakeConnectionConfig));

      readable.push("hello world");
      readable.push(null);

      writable.emit("close");
    });

    it("should reject if the client throws an error", function(done) {
      const fakeConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFilePath": "",
        "user": "",
        "password": "",
      };

      const mockFtpClient = new EventEmitter();
      mockFtpClient.connect = (connectionconfiguration) => {
        mockFtpClient.emit("ready");
      };
      mockFtpClient.on("ready", () => { });
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
      (getFileViaFtp(mockFtpClient)(new Writable())(fakeConnectionConfig));
    });

    it("should reject if get fails", function(done) {
      const fakeConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFilePath": "",
        "user": "",
        "password": "",
      };

      const mockedError = {"code": "503", "message": "get failed"};

      const mockFtpClient = new EventEmitter();
      mockFtpClient.connect = (connectionconfiguration) => {
        mockFtpClient.emit("ready");
      };
      mockFtpClient.on("ready", () => { });
      mockFtpClient.put = () => { };
      mockFtpClient.get = (p, cb) => {
        cb(null, mockedError);
      };
      mockFtpClient.end = () => { };

      fork
      (err => {
        expect(err).to.equal("503 get failed");
        done();
      })
      (done)
      (sendFileViaFtp(mockFtpClient)(new Writable())(fakeConnectionConfig));
    });
  });

  describe("sendFileViaFtp", function() {
    it("should return a future", function() {
      const fakeConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFilePath": "",
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

      expect(sendFileViaFtp(mockFtpClient)(new Readable())(fakeConnectionConfig)).to.be.instanceOf(Future);
    });

    it("should resolve with a success message if put succeeds", function(done) {
      const fakeConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFilePath": "",
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
      (sendFileViaFtp(mockFtpClient)(new Readable())(fakeConnectionConfig));
    });

    it("should reject if the client throws an error", function(done) {
      const fakeConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFilePath": "",
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
      (sendFileViaFtp(mockFtpClient)(new Readable())(fakeConnectionConfig));
    });

    it("should reject if put fails", function(done) {
      const fakeConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFilePath": "",
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
      (sendFileViaFtp(mockFtpClient)(new Readable())(fakeConnectionConfig));
    });
  });
});
