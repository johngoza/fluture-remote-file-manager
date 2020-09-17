const EventEmitter = require("events");
const {expect} = require("chai");
const {fork} = require("fluture");
const {getFileViaSftp, getFileMetadata, sendFileViaSftp, verifyAndGetFileViaSftp} = require("../../../lib/sftp");
const {Readable, PassThrough} = require("stream");

describe("Unit Tests - sftp.js", function() {
  describe("getFileViaSftp", function() {
    it("should resolve with a readstream if get succeeds", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFileName": "some_file.txt",
        "remoteDirectory": "",
        "user": "",
        "password": "",
      };

      const readable = new Readable();
      const mockSftpClient = new EventEmitter();

      const sftp = {
        "createReadStream": (remoteFileName) => {
          return readable;
        },
      };

      mockSftpClient.sftp = (cb) => {
        cb(null, sftp);
      };
      mockSftpClient.connect = () => {
        mockSftpClient.emit("ready");
      };
      mockSftpClient.on("ready", () => {});
      mockSftpClient.end = () => {};

      const validateResults = data => {
        let result = "";

        data.on("data", function(d) {
          result += d.toString();
        });

        data.on("end", function() {
          expect(result).to.deep.equal("hello world");
          done();
        });
      };

      fork
      (done)
      (validateResults)
      (getFileViaSftp(mockSftpClient)(mockConnectionConfig));

      readable.emit("ready");
      readable.push("hello world");
      readable.push(null);
    });

    it("should reject if get method fails", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFileName": "some_file.txt",
        "remoteDirectory": "",
        "user": "",
        "password": "",
      };

      const readable = new Readable();
      const mockSftpClient = new EventEmitter();

      const sftp = {
        "createReadStream": (remoteFileName) => {
          return readable;
        },
      };

      mockSftpClient.sftp = (cb) => {
        cb(null, sftp);
      };
      mockSftpClient.connect = () => {
        mockSftpClient.emit("ready");
      };
      mockSftpClient.on("ready", () => {});
      mockSftpClient.end = () => {};

      fork
      (err => {
        expect(err).to.deep.equal({"code": "503", "message": "get failed"});
        done();
      })
      (done)
      (getFileViaSftp(mockSftpClient)(mockConnectionConfig));

      readable.emit("error", {"code": "503", "message": "get failed"});
      readable.destroy();
    });

    it("should reject if there is an error getting the sftp client", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFileName": "some_file.txt",
        "remoteDirectory": "",
        "user": "",
        "password": "",
      };

      const readable = new Readable();
      readable.push("hello world");
      readable.push(null);

      const mockSftpClient = new EventEmitter();
      const mockError = "Error constructing SFTP";

      mockSftpClient.sftp = (cb) => {
        cb(mockError, null);
      };
      mockSftpClient.connect = () => {
        mockSftpClient.emit("ready");
      };
      mockSftpClient.on("ready", () => {});
      mockSftpClient.end = () => {};

      const verifyResult = err => {
        expect(err).to.equal(mockError);
        done();
      };

      fork
      (verifyResult)
      (done)
      (getFileViaSftp(mockSftpClient)(mockConnectionConfig));
    });

    it("should reject if there is an error emitted by the client", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFileName": "some_file.txt",
        "remoteDirectory": "",
        "user": "",
        "password": "",
      };

      const mockSftpClient = new EventEmitter();
      const mockError = "Error constructing SFTP";

      mockSftpClient.sftp = (cb) => {
        mockSftpClient.emit("error", mockError);
      };
      mockSftpClient.connect = () => {
        mockSftpClient.emit("ready");
      };
      mockSftpClient.end = () => {};

      const verifyResult = err => {
        expect(err).to.equal(mockError);
        done();
      };

      fork
      (verifyResult)
      (done)
      (getFileViaSftp(mockSftpClient)(mockConnectionConfig));
    });
  });

  describe("getFileMetadata", function() {
    it("should resolve with a list of files in a directory if everything exists", function(done) {
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
          "filename": "hello.txt",
          "size": "0 MB",
        },
      ];

      const sftp = {
        "readdir": (remoteDirectory, cb) => {
          cb(null, mockFileList);
        },
      };

      const mockSftpClient = new EventEmitter();
      mockSftpClient.sftp = (cb) => {
        cb(null, sftp);
      };
      mockSftpClient.connect = () => { };
      mockSftpClient.end = () => { };

      fork
      (done)
      (data => {
        expect(data).to.deep.equal(mockFileList);
        done();
      })
      (getFileMetadata(mockConnectionConfig)(mockSftpClient));
    });

    it("should reject with an error if sftp callback returns one", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFileName": "hello.txt",
        "remoteDirectory": "",
        "user": "",
        "password": "",
      };

      const mockError = {
        "code": "400",
        "message": "Directory not found",
      };

      const mockSftpClient = new EventEmitter();
      mockSftpClient.sftp = (cb) => {
        cb(mockError);
      };
      mockSftpClient.connect = () => { };
      mockSftpClient.end = () => { };

      fork
      (err => {
        expect(err).to.deep.equal("400 Directory not found");
        done();
      })
      (done)
      (getFileMetadata(mockConnectionConfig)(mockSftpClient));
    });

    it("should reject with an error if readdir callback returns one", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFileName": "hello.txt",
        "remoteDirectory": "",
        "user": "",
        "password": "",
      };

      const mockError = {
        "code": "400",
        "message": "Directory not found",
      };

      const sftp = {
        "readdir": (remoteDirectory, cb) => {
          cb(mockError);
        },
      };

      const mockSftpClient = new EventEmitter();
      mockSftpClient.sftp = (cb) => {
        cb(null, sftp);
      };
      mockSftpClient.connect = () => { };
      mockSftpClient.end = () => { };

      fork
      (err => {
        expect(err).to.deep.equal("400 Directory not found");
        done();
      })
      (done)
      (getFileMetadata(mockConnectionConfig)(mockSftpClient));
    });

    it("should reject with an error if one is emitted", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFileName": "hello.txt",
        "remoteDirectory": "",
        "user": "",
        "password": "",
      };

      const mockError = {
        "code": "400",
        "message": "Directory not found",
      };

      const mockSftpClient = new EventEmitter();
      mockSftpClient.sftp = (cb) => {
        mockSftpClient.emit("error", mockError);
      };
      mockSftpClient.connect = () => { };
      mockSftpClient.end = () => { };

      fork
      (err => {
        expect(err).to.deep.equal(mockError);
        done();
      })
      (done)
      (getFileMetadata(mockConnectionConfig)(mockSftpClient));
    });
  });

  describe("sendFileViaSftp", function() {
    it("should resolve with a success message if put succeeds", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFileName": "some_file.txt",
        "remoteDirectory": "",
        "user": "",
        "password": "",
      };

      const readable = new Readable();
      readable.push("hello world");
      readable.push(null);

      const passThrough = new PassThrough();
      const mockSftpClient = new EventEmitter();

      const sftp = {
        "createWriteStream": (remoteFileName) => {
          return passThrough;
        },
      };

      mockSftpClient.sftp = (cb) => {
        cb(null, sftp);
      };
      mockSftpClient.connect = () => {
        mockSftpClient.emit("ready");
      };
      mockSftpClient.on("ready", () => {});
      mockSftpClient.end = () => {};

      const verifyResult = result => {
        expect(result).to.equal("Upload successful");
        done();
      };

      fork
      (done)
      (verifyResult)
      (sendFileViaSftp(mockSftpClient)(readable)(mockConnectionConfig));
      passThrough.emit("ready");
      passThrough.emit("close");
    });

    it("should reject if file send fails", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFileName": "some_file.txt",
        "remoteDirectory": "",
        "user": "",
        "password": "",
      };

      const readable = new Readable();
      readable.push("hello world");
      readable.push(null);

      const passThrough = new PassThrough();
      const mockSftpClient = new EventEmitter();

      const sftp = {
        "createWriteStream": (remoteFileName) => {
          return passThrough;
        },
      };

      mockSftpClient.sftp = (cb) => {
        cb(null, sftp);
      };
      mockSftpClient.connect = () => {
        mockSftpClient.emit("ready");
      };
      mockSftpClient.on("ready", () => {});
      mockSftpClient.end = () => {};

      const verifyResult = err => {
        expect(err).to.equal("SFTP error");
        done();
      };

      fork
      (verifyResult)
      (done)
      (sendFileViaSftp(mockSftpClient)(readable)(mockConnectionConfig));
      passThrough.emit("error", "SFTP error");
    });

    it("should reject if there is an error getting the sftp client", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFileName": "some_file.txt",
        "remoteDirectory": "",
        "user": "",
        "password": "",
      };

      const readable = new Readable();
      readable.push("hello world");
      readable.push(null);

      const mockSftpClient = new EventEmitter();
      const mockError = "Error constructing SFTP";

      mockSftpClient.sftp = (cb) => {
        cb(mockError, null);
      };
      mockSftpClient.connect = () => {
        mockSftpClient.emit("ready");
      };
      mockSftpClient.on("ready", () => {});
      mockSftpClient.end = () => {};

      const verifyResult = err => {
        expect(err).to.equal(mockError);
        done();
      };

      fork
      (verifyResult)
      (done)
      (sendFileViaSftp(mockSftpClient)(readable)(mockConnectionConfig));
    });
  });

  describe("verifyAndGetFile", function() {
    it("should resolve with a readstream", function(done) {
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
          "filename": "hello.txt",
          "size": "0 MB",
        },
      ];

      const readable = new Readable();
      const mockSftpClient = new EventEmitter();

      const sftp = {
        "createReadStream": (remoteFileName) => {
          return readable;
        },
        "readdir": (remoteDirectory, cb) => {
          cb(null, mockFileList);
        },
      };

      mockSftpClient.sftp = (cb) => {
        cb(null, sftp);
      };
      mockSftpClient.connect = () => {
        mockSftpClient.emit("ready");
      };
      mockSftpClient.on("ready", () => {});
      mockSftpClient.end = () => {};

      const validateResults = data => {
        let result = "";

        data.on("data", function(d) {
          result += d.toString();
        });

        data.on("end", function() {
          expect(result).to.deep.equal("hello world");
          done();
        });
      };

      fork
      (done)
      (validateResults)
      (verifyAndGetFileViaSftp(mockSftpClient)(mockConnectionConfig));

      readable.emit("ready");
      readable.push("hello world");
      readable.push(null);
    });

    it("should reject if an error is encountered on GET", function(done) {
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
          "filename": "hello.txt",
          "size": "0 MB",
        },
      ];

      const mockError = {
        "message": "an error occurred",
        "code": "500",
      };

      const readable = new Readable();
      const mockSftpClient = new EventEmitter();

      const sftp = {
        "createReadStream": (remoteFileName) => {
          return readable;
        },
        "readdir": (remoteDirectory, cb) => {
          cb(null, mockFileList);
        },
      };

      mockSftpClient.sftp = (cb) => {
        cb(null, sftp);
      };
      mockSftpClient.connect = () => {
        mockSftpClient.emit("ready");
      };
      mockSftpClient.on("ready", () => {});
      mockSftpClient.end = () => {};

      fork
      (err => {
        expect(err).to.deep.equal(mockError);
        done();
      })
      (done)
      (verifyAndGetFileViaSftp(mockSftpClient)(mockConnectionConfig));

      readable.emit("error", mockError);
      readable.push(null);
    });

    it("should reject if the client encounters and error elsewhere", function(done) {
      const mockConnectionConfig = {
        "host": "",
        "port": 1,
        "remoteFileName": "hello.txt",
        "remoteDirectory": "",
        "user": "",
        "password": "",
      };

      const mockError = {
        "message": "an error occurred",
        "code": "500",
      };

      const mockSftpClient = new EventEmitter();

      mockSftpClient.sftp = (cb) => { };
      mockSftpClient.connect = () => {
        mockSftpClient.emit("error", mockError);
      };
      mockSftpClient.end = () => {};

      fork
      (err => {
        expect(err).to.deep.equal(mockError);
        done();
      })
      (done)
      (verifyAndGetFileViaSftp(mockSftpClient)(mockConnectionConfig));
    });
  });
});
