const chai = require("chai");
const { expect } = chai;
const { sendFileViaFtp } = require("../../../lib/ftp.js");
const Future = require("fluture");
const EventEmitter = require("events");
const { fork, reject } = Future;

describe("Unit Tests - FTP", function () {
    describe("sendFileViaFtp", function () {
        it("should return a future", function () {
            const fakeConnectionConfig = {
                "host": "",
                "port": 1,
                "remoteFilePath": "",
                "user": "",
                "password": ""
            };

            let mockFtpClient = new EventEmitter();
            mockFtpClient.connect = (connectionconfiguration) => {
                mockFtpClient.emit("ready");
            };
            mockFtpClient.on('ready', () => { });
            mockFtpClient.put = (file, path, callback) => {
                return "put failed";
            };
            mockFtpClient.end = () => { };

            expect(sendFileViaFtp(mockFtpClient)("")(fakeConnectionConfig)).to.be.instanceOf(Future);
        });

        it("should resolve with a success message if put succeeds", function (done) {
            const fakeConnectionConfig = {
                "host": "",
                "port": 1,
                "remoteFilePath": "",
                "user": "",
                "password": ""
            };

            let mockFtpClient = new EventEmitter();
            mockFtpClient.connect = (connectionconfiguration) => {
                mockFtpClient.emit("ready");
            };
            mockFtpClient.on('ready', () => { });
            mockFtpClient.put = (file, path, callback) => {
                callback();
            };
            mockFtpClient.end = () => { };

            fork
                (done)
                (result => {
                    expect(result).to.equal("Upload successful");
                    done();
                })
                (sendFileViaFtp(mockFtpClient)("")(fakeConnectionConfig))
        });

        it("should reject if file send fails", function (done) {
            const fakeConnectionConfig = {
                "host": "",
                "port": 1,
                "remoteFilePath": "",
                "user": "",
                "password": ""
            };

            let mockFtpClient = new EventEmitter();
            mockFtpClient.connect = (connectionconfiguration) => {
                mockFtpClient.emit("ready");
            };
            mockFtpClient.on('ready', () => { });
            mockFtpClient.put = (f, p, cb) => {
                mockFtpClient.emit("error", { code: "503", message: "put failed" });
            };
            mockFtpClient.end = () => { };

            fork
                (err => {
                    expect(err).to.equal("503 put failed");
                    done();
                })
                (done)
                (sendFileViaFtp(mockFtpClient)("")(fakeConnectionConfig))
        });
    });
});
