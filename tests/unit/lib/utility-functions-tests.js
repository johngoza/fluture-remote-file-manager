const {expect} = require("chai");
const fs = require("fs");
const {fork} = require("fluture");
const {createReadStream, base64EncodeData} = require("../../../lib/utility-functions.js");

describe("Unit Tests - UtilityFunctions", function() {
  describe("base64EncodeData", function() {
    it("should correctly encode given data into base64", function(done) {
      const expectedResult = "aGVsbG8gd29ybGQ=";

      const data = "hello world";

      fork
      (done)
      (result => {
        expect(result).to.equal(expectedResult);
        done();
      })
      (base64EncodeData(data));
    });
  });
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
