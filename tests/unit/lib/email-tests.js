const EventEmitter = require("events");
const Future = require("fluture");
const {expect} = require("chai");
const {sendFileViaEmail} = require("../../../lib/email.js");
const {fork} = Future;
const {Readable} = require("stream");

describe("Unit Tests - Email", function() {
  describe("sendFileViaEmail", function() {
    it("should return a future", function() {
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
      mockTransport.sendMail = (message) => {
        return "sent successfully!";
      };
      mockTransport.close = () => {};
      const mockEmailClient = {
        "createTransport": (config) => { return mockTransport; },
      };

      expect(sendFileViaEmail(mockEmailClient)(new Readable())(mockConfig)).to.be.instanceOf(Future);
    });

    it("should resolve with a success message if the email sends", function(done) {
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

      fork
      (done)
      (result => {
        expect(result).to.equal("Upload successful");
        done();
      })
      (sendFileViaEmail(mockEmailClient)(new Readable())(mockConfig));
    });

    it("should reject if the email sending fails", function(done) {
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

      const invalidLoginError = {
        "code": "EAUTH",
        "message": "Invalid login: 535 5.7.8 Sorry.",
      };

      const mockTransport = new EventEmitter();
      mockTransport.sendMail = (message, cb) => {
        cb(invalidLoginError, null);
      };
      mockTransport.close = () => {};

      const mockEmailClient = {
        "createTransport": (config) => { return mockTransport; },
      };

      const expectedResult = invalidLoginError.code + " " + invalidLoginError.message;

      fork
      (err => {
        expect(err).to.equal(expectedResult);
        done();
      })
      (done)
      (sendFileViaEmail(mockEmailClient)(new Readable())(mockConfig));
    });
  });
});
