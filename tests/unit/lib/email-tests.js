const {expect} = require("chai");
const {sendFileViaEmail} = require("../../../lib/email.js");
const Future = require("fluture");
const EventEmitter = require("events");
const {fork} = Future;
const {Readable} = require("stream");

describe("Unit Tests - Email", function() {
  describe("sendFileViaEmail", function() {
    it("should return a future", function() {
      const fakeConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFilePath": "",
        "user": "",
        "password": "",
      };

      const mockEmailClient = new EventEmitter();
      mockEmailClient.connect = (connectionconfiguration) => {
        mockEmailClient.emit("ready");
      };
      mockEmailClient.on("ready", () => { });
      mockEmailClient.put = () => {
        return "put failed";
      };
      mockEmailClient.end = () => { };

      expect(sendFileViaEmail(mockEmailClient)(new Readable())(fakeConnectionConfig)).to.be.instanceOf(Future);
    });

    it("should resolve with a success message if put succeeds", function(done) {
      const fakeConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFilePath": "",
        "user": "",
        "password": "",
      };

      const mockEmailClient = new EventEmitter();
      mockEmailClient.connect = (connectionconfiguration) => {
        mockEmailClient.emit("ready");
      };
      mockEmailClient.on("ready", () => { });
      mockEmailClient.put = (file, path, callback) => {
        callback();
      };
      mockEmailClient.end = () => { };

      fork
      (done)
      (result => {
        expect(result).to.equal("Upload successful");
        done();
      })
      (sendFileViaEmail(mockEmailClient)(new Readable())(fakeConnectionConfig));
    });

    it("should reject if file send fails", function(done) {
      const fakeConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFilePath": "",
        "user": "",
        "password": "",
      };

      const mockEmailClient = new EventEmitter();
      mockEmailClient.connect = (connectionconfiguration) => {
        mockEmailClient.emit("ready");
      };
      mockEmailClient.on("ready", () => { });
      mockEmailClient.put = (f, p, cb) => {
        mockEmailClient.emit("error", {"code": "503", "message": "put failed"});
      };
      mockEmailClient.end = () => { };

      fork
      (err => {
        expect(err).to.equal("503 put failed");
        done();
      })
      (done)
      (sendFileViaEmail(mockEmailClient)(new Readable())(fakeConnectionConfig));
    });
  });
});
