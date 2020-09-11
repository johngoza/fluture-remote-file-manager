const EventEmitter = require("events");
const {expect} = require("chai");
const {Future, fork} = require("fluture");
const {getFileViaFtp, sendFileViaFtp} = require("../../../lib/ftp.js");
const {Readable} = require("stream");

describe("Unit Tests - ftp.js", function() {
  describe("getFileViaFtp", function() {
    it("should return a future", function() {
      const fakeConnectionConfig = {
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

      expect(getFileViaFtp(mockFtpClient)(fakeConnectionConfig)).to.be.instanceOf(Future);
    });

    it("should resolve with a success message if get succeeds", function(done) {
      const fakeConnectionConfig = {
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
      (getFileViaFtp(mockFtpClient)(fakeConnectionConfig));

      readable.push("hello world");
      readable.push(null);
    });

    it("should reject if get fails", function(done) {
      const fakeConnectionConfig = {
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
      (getFileViaFtp(mockFtpClient)(fakeConnectionConfig));
    });

    it("should reject if the client throws an error during get", function(done) {
      const fakeConnectionConfig = {
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
      (getFileViaFtp(mockFtpClient)(fakeConnectionConfig));
    });
  });

  describe("sendFileViaFtp", function() {
    it("should return a future", function() {
      const fakeConnectionConfig = {
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

      expect(sendFileViaFtp(mockFtpClient)(new Readable())(fakeConnectionConfig)).to.be.instanceOf(Future);
    });

    it("should resolve with a success message if put succeeds", function(done) {
      const fakeConnectionConfig = {
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
      (sendFileViaFtp(mockFtpClient)(new Readable())(fakeConnectionConfig));
    });

    it("should reject if the client throws an error", function(done) {
      const fakeConnectionConfig = {
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
      (sendFileViaFtp(mockFtpClient)(new Readable())(fakeConnectionConfig));
    });

    it("should reject if put fails", function(done) {
      const fakeConnectionConfig = {
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
      (sendFileViaFtp(mockFtpClient)(new Readable())(fakeConnectionConfig));
    });
  });
});
