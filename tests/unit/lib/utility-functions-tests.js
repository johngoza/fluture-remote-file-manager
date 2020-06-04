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
  });
});
