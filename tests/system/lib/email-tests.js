const NodeMailer = require("nodemailer");
const path = require("path");
const Readable = require("stream").Readable;
const {fork} = require("fluture");
const {sendFileViaEmail} = require(path.join(__dirname, "../../../lib/email.js"));
const expect = require("chai").expect;

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
        console.log(data);
        // expect(data).to.deep.equal("ashfihasb");
        done();
      })
      (sendFileViaEmail(NodeMailer) (readable) (config));

      readable.push("hello world");
      readable.push(null);
      readable.emit("end");
      // readable.destroy();
    });
  });
});
