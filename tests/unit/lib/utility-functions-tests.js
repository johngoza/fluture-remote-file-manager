const EventEmitter = require("events");
const fs = require("fs");
const {
  createObjectHash,
  createReadStream,
  filterFileMetadata,
  rejectOnLeft,
  validateConnectionConfig,
  verifyFileSignature,
} = require("../../../lib/utility-functions");
const {expect} = require("chai");
const {fork} = require("fluture");
const {S} = require("../../../lib/sanctuary-environment");

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
    it("should resolve with the only the specific file's metadata if present", function() {
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

      const result = filterFileMetadata(mockConnectionConfig)("name")(mockFileList);
      expect(result).to.deep.equal(S.Right(expectedData));
    });

    it("should reject with descriptive error if file isn't present", function() {
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

      const result = filterFileMetadata(mockConnectionConfig)("name")(mockFileList);
      expect(result).to.deep.equal(S.Left(expectedError));
    });
  });

  describe("rejectOnLeft", function() {
    it("should reject with left contents if the Either is left", function(done) {
      const mockError = "Something went wrong! Oh no!";

      fork
      (err => {
        expect(err).to.deep.equal(mockError);
        done();
      })
      (done)
      (rejectOnLeft(S.Left(mockError)));
    });

    it("should return the right contents if the Either is right", function(done) {
      const mockData = "file sent successfully";

      fork
      (done)
      (err => {
        expect(err).to.deep.equal(mockData);
        done();
      })
      (rejectOnLeft(S.Right(mockData)));
    });
  });

  describe("validateConnectionConfig", function() {
    it("should resolve with the config if all values are valid", function() {
      const config = {
        "host": "some-site",
        "port": 2,
        "remoteFileName": "some-path",
      };

      const result = validateConnectionConfig(config);
      expect(result).to.deep.equal(S.Right(config));
    });

    it("should reject if host is missing", function() {
      const config = {
        "port": 2,
        "remoteFileName": "some_path.xml",
      };

      const expectedError = ["host is missing or invalid"];

      const result = validateConnectionConfig(config);
      expect(result).to.deep.equal(S.Left(expectedError));
    });

    it("should reject if host is null", function() {
      const config = {
        "host": "",
        "port": 2,
        "remoteFileName": "some_path.xml",
      };

      const expectedError = ["host is missing or invalid"];

      const result = validateConnectionConfig(config);
      expect(result).to.deep.equal(S.Left(expectedError));
    });

    it("should reject if host is not a string", function() {
      const config = {
        "host": 13,
        "port": 2,
        "remoteFileName": "some_path.xml",
      };

      const expectedError = ["host is missing or invalid"];

      const result = validateConnectionConfig(config);
      expect(result).to.deep.equal(S.Left(expectedError));
    });

    it("should reject if port is missing", function() {
      const config = {
        "host": "some-site",
        "remoteFileName": "some_path.xml",
      };

      const expectedError = ["port is missing or invalid"];

      const result = validateConnectionConfig(config);
      expect(result).to.deep.equal(S.Left(expectedError));
    });

    it("should reject if port is null", function() {
      const config = {
        "host": "some-site",
        "port": null,
        "remoteFileName": "some_path.xml",
      };

      const expectedError = ["port is missing or invalid"];

      const result = validateConnectionConfig(config);
      expect(result).to.deep.equal(S.Left(expectedError));
    });

    it("should reject if port is not an integer", function() {
      const config = {
        "host": "some-site",
        "port": "portt",
        "remoteFileName": "some_path.xml",
      };

      const expectedError = ["port is missing or invalid"];

      const result = validateConnectionConfig(config);
      expect(result).to.deep.equal(S.Left(expectedError));
    });

    it("should reject if port is not positive", function() {
      const config = {
        "host": "some-site",
        "port": -3,
        "remoteFileName": "some_path.xml",
      };

      const expectedError = ["port is missing or invalid"];

      const result = validateConnectionConfig(config);
      expect(result).to.deep.equal(S.Left(expectedError));
    });

    it("should reject if remoteFileName is missing", function() {
      const config = {
        "host": "some-site",
        "port": 2,
      };

      const expectedError = ["remoteFileName is missing or invalid"];

      const result = validateConnectionConfig(config);
      expect(result).to.deep.equal(S.Left(expectedError));
    });

    it("should reject if remoteFileName is null", function() {
      const config = {
        "host": "some-site",
        "port": 2,
        "remoteFileName": "",
      };

      const expectedError = ["remoteFileName is missing or invalid"];

      const result = validateConnectionConfig(config);
      expect(result).to.deep.equal(S.Left(expectedError));
    });

    it("should reject if remoteFileName is not a string", function() {
      const config = {
        "host": "some-site",
        "port": 2,
        "remoteFileName": 1776,
      };

      const expectedError = ["remoteFileName is missing or invalid"];

      const result = validateConnectionConfig(config);
      expect(result).to.deep.equal(S.Left(expectedError));
    });
  });

  describe("verifyFileSignature", function() {
    it("should return a signature if one is not provided", function() {
      const mockFileMetadata = S.Just({
        "name": "hello.txt",
        "size": "1776 MB",
      });

      const expectedResult = S.Right("ff041f15a778695c5bae0d39c862b135");

      const result = verifyFileSignature("")(mockFileMetadata);
      expect(result).to.deep.equal(expectedResult);
    });

    it("should resolve with the signature if the recomputed signature matches", function() {
      const mockSignature = "ff041f15a778695c5bae0d39c862b135";

      const mockFileMetadata = S.Just({
        "name": "hello.txt",
        "size": "1776 MB",
      });

      const result = verifyFileSignature(mockSignature)(mockFileMetadata);
      expect(result).to.deep.equal(S.Right(mockSignature));
    });

    it("should reject with an error if signatures don't match", function() {
      const mockSignature = "not-a-real-signature";

      const mockFileMetadata = S.Just({
        "name": "hello.txt",
        "size": "1776 MB",
      });

      const expectedResult = S.Left("File metadata changed while attempting GET. File is not currently viable for consumption");

      const result = verifyFileSignature(mockSignature)(mockFileMetadata);
      expect(result).to.deep.equal(expectedResult);
    });
  });
});
