const chai    = require("chai");
const { expect }  = chai;
const { sendFileViaFtp } = require("../../../lib/ftp.js");
const Future  = require("fluture");
const { fork } = Future;

describe("Unit Tests - FTP", function() {
    describe("sendFileViaFtp", function() {
        it("should return a future", function() {
            const fakeConnectionConfig = {
                "host" : "",
                "port" : 1,
                "remoteFilePath" : "",
                "user" : "",
                "password" : ""
            };

            const mockFtpClient = {
                "connect" : (connectionconfiguration) => {},
                "put" : (file, path, err) => {
                    Future.resolve();
                },
                "end" : () => {}
            };

            expect(sendFileViaFtp (mockFtpClient) ("") (fakeConnectionConfig)).to.be.instanceOf(Future);
        });

        it("should resolve with a success message if put succeeds", function(done) {
            const fakeConnectionConfig = {
                "host" : "",
                "port" : 1,
                "remoteFilePath" : "",
                "user" : "",
                "password" : ""
            };

            const mockFtpClient = {
                "connect" : (connectionconfiguration) => {},
                "put" : (file, path, callback) => {
                    callback();
                },
                "end" : () => {}
            };

            fork
            (done)
            (result => {
                expect(result).to.equal("Upload successful");
                done();
            })
            (sendFileViaFtp (mockFtpClient) ("") (fakeConnectionConfig))
        });

        it("should reject if file send fails", function(done) {
            const fakeConnectionConfig = {
                "host" : "",
                "port" : 1,
                "remoteFilePath" : "",
                "user" : "",
                "password" : ""
            };

            const mockFtpClient = {
                "connect" : (connectionconfiguration) => {},
                "put" : (file, path, callback) => {
                    callback("put failed");
                },
                "end" : () => {}
            };

            fork
            (err => {
                expect(err).to.equal("Upload failed: put failed");
                done();
            })
            (done)
            (sendFileViaFtp (mockFtpClient) ("") (fakeConnectionConfig))
        });
    });
});
