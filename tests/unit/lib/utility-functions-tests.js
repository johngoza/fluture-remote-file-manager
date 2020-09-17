const EventEmitter = require("events");
const fs = require("fs");
const S = require("sanctuary");
const {
  createObjectHash,
  createReadStream,
  filterFileMetadata,
  validateConnectionConfig,
  verifyFileSignature,
} = require("../../../lib/utility-functions");
const {expect} = require("chai");
const {fork} = require("fluture");

describe("Unit Tests - UtilityFunctions", function() {
  describe("createObjectHash", function() {
    it("should return the same string when provided the same object", function() {
      const object = {
        "hello": "world",
        "hash": "me",
      };

      const firstHash = createObjectHash(JSON.stringify(object));
      const secondHash = createObjectHash(JSON.stringify(object));

      expect(firstHash).to.deep.equal(secondHash);
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

  describe("filterFileMetadata", function() {
    it("should resolve with the only the specific file's metadata if present", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFileName": "hello.txt",
        "remoteDirectory": "",
        "user": "",
        "password": "",
      };

      const mockFileList = [
        {
          "name": "hello.txt",
          "size": "1776 KB",
        },
        {
          "name": "other-file.txt",
          "size": "3 MB",
        },
      ];

      const expectedData = S.Just({
        "name": "hello.txt",
        "size": "1776 KB",
      });

      fork
      (done)
      (data => {
        expect(data).to.deep.equal(expectedData);
        done();
      })
      (filterFileMetadata(mockConnectionConfig)("name")(mockFileList));
    });

    it("should reject with descriptive error if file isn't present", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFileName": "hello.txt",
        "remoteDirectory": "/",
        "user": "",
        "password": "",
      };

      const mockFileList = [
        {
          "name": "file.txt",
          "size": "2 KB",
        },
        {
          "name": "other-file.txt",
          "size": "3 MB",
        },
      ];

      const expectedError = "file hello.txt not found on remote in directory /";

      fork
      (err => {
        expect(err).to.deep.equal(expectedError);
        done();
      })
      (done)
      (filterFileMetadata(mockConnectionConfig)("name")(mockFileList));
    });
  });

  describe("validateConnectionConfig", function() {
    it("should resolve with the config if all values are valid", function(done) {
      const config = {
        "host": "some-site",
        "port": 2,
        "remoteFileName": "some-path",
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
        "remoteFileName": "some_path.xml",
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
        "remoteFileName": "some_path.xml",
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
        "remoteFileName": "some_path.xml",
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
        "remoteFileName": "some_path.xml",
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
        "remoteFileName": "some_path.xml",
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
        "remoteFileName": "some_path.xml",
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
        "remoteFileName": "some_path.xml",
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

    it("should reject if remoteFileName is missing", function(done) {
      const config = {
        "host": "some-site",
        "port": 2,
      };

      const expectedError = ["remoteFileName is missing or invalid"];

      fork
      (err => {
        expect(err).to.deep.equal(expectedError);
        done();
      })
      (done)
      (validateConnectionConfig(config));
    });

    it("should reject if remoteFileName is null", function(done) {
      const config = {
        "host": "some-site",
        "port": 2,
        "remoteFileName": "",
      };

      const expectedError = ["remoteFileName is missing or invalid"];

      fork
      (err => {
        expect(err).to.deep.equal(expectedError);
        done();
      })
      (done)
      (validateConnectionConfig(config));
    });

    it("should reject if remoteFileName is not a string", function(done) {
      const config = {
        "host": "some-site",
        "port": 2,
        "remoteFileName": 1776,
      };

      const expectedError = ["remoteFileName is missing or invalid"];

      fork
      (err => {
        expect(err).to.deep.equal(expectedError);
        done();
      })
      (done)
      (validateConnectionConfig(config));
    });
  });

  describe("verifyFileSignature", function() {
    it("should put a signature on the connection config if one is not present", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFileName": "",
        "remoteDirectory": "",
        "user": "",
        "password": "",
      };

      const mockFileMetadata = S.Just({
        "name": "hello.txt",
        "size": "1776 MB",
      });

      const expectedResult = {
        "host": "",
        "port": 1,
        "remoteFileName": "",
        "remoteDirectory": "",
        "user": "",
        "password": "",
        "fileSignature": "ff041f15a778695c5bae0d39c862b135",
      };

      fork
      (done)
      (data => {
        expect(data).to.deep.equal(expectedResult);
        done();
      })
      (verifyFileSignature(mockConnectionConfig)(mockFileMetadata));
    });

    it("should resolve with the connection config if signatures match", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFileName": "",
        "remoteDirectory": "",
        "user": "",
        "password": "",
        "fileSignature": "ff041f15a778695c5bae0d39c862b135",
      };

      const mockFileMetadata = S.Just({
        "name": "hello.txt",
        "size": "1776 MB",
      });

      const expectedResult = {
        "host": "",
        "port": 1,
        "remoteFileName": "",
        "remoteDirectory": "",
        "user": "",
        "password": "",
        "fileSignature": "ff041f15a778695c5bae0d39c862b135",
      };

      fork
      (done)
      (data => {
        expect(data).to.deep.equal(expectedResult);
        done();
      })
      (verifyFileSignature(mockConnectionConfig)(mockFileMetadata));
    });

    it("should reject with an error if signatures don't match", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFileName": "",
        "remoteDirectory": "",
        "user": "",
        "password": "",
        "fileSignature": "not-a-real-signature",
      };

      const mockFileMetadata = S.Just({
        "name": "hello.txt",
        "size": "1776 MB",
      });

      const expectedResult = "File metadata changed while attempting GET. File is not currently viable for consumption";

      fork
      (err => {
        expect(err).to.deep.equal(expectedResult);
        done();
      })
      (done)
      (verifyFileSignature(mockConnectionConfig)(mockFileMetadata));
    });
  });
});
