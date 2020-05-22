const chai = require("chai");
const { expect } = chai;
const { sendFileViaSftp } = require("../../../lib/sftp.js");
const Future = require("fluture");
const { fork } = Future;
const EventEmitter = require("events");
const { Readable, PassThrough } = require("stream");

describe("Unit Tests - SFTP", function () {
  describe("sendFileViaSftp", function () {
    it("should return a future", function () {
      const fakeConnectionConfig = {
        host: "",
        port: 1,
        remoteFilePath: "",
        user: "",
        password: ""
      };

      expect(sendFileViaSftp({})("")(fakeConnectionConfig)).to.be.instanceOf(Future);
    });

    it("should resolve with a success message if put succeeds", function (done) {
      const fakeConnectionConfig = {
        host: "",
        port: 1,
        remoteFilePath: "some_file.txt",
        user: "",
        password: ""
      };

      const readable = new Readable();
      readable.push("hello world");
      readable.push(null);

      const passThrough = new PassThrough();
      const mockSftpClient = new EventEmitter();

      const sftp = {
        createWriteStream: (remoteFilePath) => {
          return passThrough;
        }
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
      (sendFileViaSftp(mockSftpClient)(readable)(fakeConnectionConfig));
      passThrough.emit("close");
    });

    it("should reject if file send fails", function (done) {
      const fakeConnectionConfig = {
        host: "",
        port: 1,
        remoteFilePath: "",
        user: "",
        password: ""
      };

      const readable = new Readable();
      readable.push("hello world");
      readable.push(null);

      const passThrough = new PassThrough();
      const mockSftpClient = new EventEmitter();

      const sftp = {
        createWriteStream: (remoteFilePath) => {
          return passThrough;
        }
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
      (sendFileViaSftp(mockSftpClient)(readable)(fakeConnectionConfig));
      passThrough.emit("error", "SFTP error");
    });
  });
});
