const EventEmitter = require("events");
const fs = require("fs");
const {createReadStream, validateConnectionConfig} = require("../../../lib/utility-functions.js");
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
      (createReadStream(fs) ("tests/unit/resources/hello.txt"));
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
      (createReadStream(mockFs) (""));

      mockReadStream.emit("error", mockError);
    });
  });

  describe("validateConnectionConfig", function() {
    it("should resolve with the config if all values are valid", function(done) {
      const config = {
        "host": "some-site",
        "port": 2,
        "remoteFilePath": "some-path",
      };

      fork
      (done)
      (data => {
        expect(data).to.deep.equal(config);
        done();
      })
      (validateConnectionConfig(config));
    });

    it("should reject if host is missing", function(done) {
      const config = {
        "port": 2,
        "remoteFilePath": "some_path.xml",
      };

      const expectedError = ["host is missing or invalid"];

      fork
      (err => {
        expect(err).to.deep.equal(expectedError);
        done();
      })
      (done)
      (validateConnectionConfig(config));
    });

    it("should reject if host is null", function(done) {
      const config = {
        "host": "",
        "port": 2,
        "remoteFilePath": "some_path.xml",
      };

      const expectedError = ["host is missing or invalid"];

      fork
      (err => {
        expect(err).to.deep.equal(expectedError);
        done();
      })
      (done)
      (validateConnectionConfig(config));
    });

    it("should reject if host is not a string", function(done) {
      const config = {
        "host": 13,
        "port": 2,
        "remoteFilePath": "some_path.xml",
      };

      const expectedError = ["host is missing or invalid"];

      fork
      (err => {
        expect(err).to.deep.equal(expectedError);
        done();
      })
      (done)
      (validateConnectionConfig(config));
    });

    it("should reject if port is missing", function(done) {
      const config = {
        "host": "some-site",
        "remoteFilePath": "some_path.xml",
      };

      const expectedError = ["port is missing or invalid"];

      fork
      (err => {
        expect(err).to.deep.equal(expectedError);
        done();
      })
      (done)
      (validateConnectionConfig(config));
    });

    it("should reject if port is null", function(done) {
      const config = {
        "host": "some-site",
        "port": null,
        "remoteFilePath": "some_path.xml",
      };

      const expectedError = ["port is missing or invalid"];

      fork
      (err => {
        expect(err).to.deep.equal(expectedError);
        done();
      })
      (done)
      (validateConnectionConfig(config));
    });

    it("should reject if port is not an integer", function(done) {
      const config = {
        "host": "some-site",
        "port": "portt",
        "remoteFilePath": "some_path.xml",
      };

      const expectedError = ["port is missing or invalid"];

      fork
      (err => {
        expect(err).to.deep.equal(expectedError);
        done();
      })
      (done)
      (validateConnectionConfig(config));
    });

    it("should reject if port is not positive", function(done) {
      const config = {
        "host": "some-site",
        "port": -3,
        "remoteFilePath": "some_path.xml",
      };

      const expectedError = ["port is missing or invalid"];

      fork
      (err => {
        expect(err).to.deep.equal(expectedError);
        done();
      })
      (done)
      (validateConnectionConfig(config));
    });

    it("should reject if remoteFilePath is missing", function(done) {
      const config = {
        "host": "some-site",
        "port": 2,
      };

      const expectedError = ["remoteFilePath is missing or invalid"];

      fork
      (err => {
        expect(err).to.deep.equal(expectedError);
        done();
      })
      (done)
      (validateConnectionConfig(config));
    });

    it("should reject if remoteFilePath is null", function(done) {
      const config = {
        "host": "some-site",
        "port": 2,
        "remoteFilePath": "",
      };

      const expectedError = ["remoteFilePath is missing or invalid"];

      fork
      (err => {
        expect(err).to.deep.equal(expectedError);
        done();
      })
      (done)
      (validateConnectionConfig(config));
    });

    it("should reject if remoteFilePath is not a string", function(done) {
      const config = {
        "host": "some-site",
        "port": 2,
        "remoteFilePath": 1776,
      };

      const expectedError = ["remoteFilePath is missing or invalid"];

      fork
      (err => {
        expect(err).to.deep.equal(expectedError);
        done();
      })
      (done)
      (validateConnectionConfig(config));
    });
  });
});
