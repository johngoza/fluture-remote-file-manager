const EventEmitter = require("events");
const Future = require("fluture");
const {expect} = require("chai");
const {sendFileViaFtp} = require("../../../lib/ftp.js");
const {fork} = Future;
const {Readable} = require("stream");

describe("Unit Tests - FTP", function() {
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
