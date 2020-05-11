const chai    = require("chai");
const { assert, expect }  = chai;
const { sendFile } = require("../../../lib/ftp.js");
const Future  = require("fluture");
const { fork, resolve, reject } = Future;

describe("Unit Tests - FTP", function() {
    describe("sendFile", function() {
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
                }
            };

            expect(sendFile (mockFtpClient) ("") (fakeConnectionConfig)).to.be.instanceOf(Future);
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
                }
            };

            fork
            (done)
            (result => {
                expect(result).to.equal("File sent successfully");
                done();
            })
            (sendFile (mockFtpClient) ("") (fakeConnectionConfig))
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
                }
            };

            fork
            (err => {
                expect(err).to.equal("Put to FTP failed with error: put failed");
                done();
            })
            (done)
            (sendFile (mockFtpClient) ("") (fakeConnectionConfig))
        });
    });
});
