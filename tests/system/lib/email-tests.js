const expect = require("chai").expect;
const NodeMailer = require("nodemailer");
const path = require("path");
const Readable = require("stream").Readable;
const {fork} = require("fluture");
const {sendFileViaEmail} = require(path.join(__dirname, "../../../lib/email.js"));

// The expect wrapped in a try/catch is bad practice
// but is unfortunately required as smtpserver changes the context
// inside that block and errors do not report correctly.
// Do not remove the try/catch.
describe("SYSTEM TESTS - email.js", function() {
  describe("sendFileViaEmail", function() {
    it("should hit smtp correctly", function(done) {
      const message = {
        "to": "alexanderhamilton@email.com",
        "from": "thomasjefferson@email.com",
        "subject": "this is a test",
        "text": "hi!",
      };

      const config = {
        "host": "localhost",
        "port": 587,
        "remoteFilePath": "hello.txt",
        "auth": {
          "user": "user",
          "pass": "password",
        },
        "tls": {
          "rejectUnauthorized": false,
        },
        "message": message,
      };

      const readable = new Readable();

      fork
      (err => {
        done(err);
      })
      (data => {
        try {
          expect(data.response).to.deep.equal("250 accepted");
          done();
        } catch (err) {
          done(err);
        }
      })
      (sendFileViaEmail(NodeMailer) (readable) (config));

      readable.push("hello world");
      readable.push(null);
      readable.emit("end");
    });
  });
});
