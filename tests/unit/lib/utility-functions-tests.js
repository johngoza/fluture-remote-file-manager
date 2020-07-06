const EventEmitter = require("events");
const fs = require("fs");
const {createReadStream} = require("../../../lib/utility-functions.js");
const {expect} = require("chai");
const {fork} = require("fluture");

describe("Unit Tests - UtilityFunctions", function() {
  describe("createReadStream", function() {
    it("should not break fs read functionality", function(done) {
      const verifyResults = (readStream) => {
        const chunks = [];

        readStream.on("data", data => {
          chunks.push(data);
        });

        readStream.on("end", () => {
          const result = Buffer.concat(chunks).toString("utf8");
          expect(result).to.deep.equal("hello world");
          done();
        });
      };

      fork
      (done)
      (verifyResults)
      (createReadStream(fs, "tests/unit/resources/hello.txt"));
    });

    it("should reject if the file read throws an error", function(done) {
      const mockReadStream = new EventEmitter();

      const mockFs = {
        "createReadStream": () => { return mockReadStream; },
      };

      const mockError = {"code": "ERR501", "message": "there was an error reading the file!"};
      const expectedResult = "Unable to read file. " + mockError.code + " " + mockError.message;

      fork
      (err => {
        expect(err).to.equal(expectedResult);
        done();
      })
      (done)
      (createReadStream(mockFs, ""));

      mockReadStream.emit("error", mockError);
    });
  });
});
