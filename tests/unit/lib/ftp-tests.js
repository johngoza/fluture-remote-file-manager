const chai    = require("chai");
const { assert, expect }  = chai;
const { SendFile } = require("../../../lib/ftp.js");
const Future  = require("fluture");
const { fork, resolve, reject } = Future;


describe("Unit Tests - FTP", function() {
    describe("SendFile", function() {
        it("should return a future", function() {
            const fakeConnectionConfig = {
                "host" : "",
                "port" : "1",
                "remoteFilePath" : "",
                "user" : "",
                "password" : {
                    "obj" : "val"
                }
            };

            const mockFtpClient = {
                "connect" : (connectionconfiguration) => {},
                "put" : (file, path, err) => {
                    Future.resolve();
                }
            };

            expect(SendFile (mockFtpClient) ("") (fakeConnectionConfig)).to.be.instanceOf(Future);
        });

        it("should resolve with a success message if put succeeds", function() {
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

            fork 
            (err => {
                assert.fail();
            })
            (result => {
                expect(result).to.equal("File sent successfully");
            })
            (SendFile (mockFtpClient) ("") (fakeConnectionConfig))
        });

        it("should resolve with a descriptive error if put fails", function() {
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
                    err("string");
                }
            };

            fork 
            (err => {
                expect(err).to.equal("put failed");
            })
            (result => {
                console.log(result);
            })
            (SendFile (mockFtpClient) ("") (fakeConnectionConfig))
        });
    });
});
