const chai    = require("chai");
const expect  = chai.expect;
const ftp = require("../../../lib/ftp.js");
const Future  = require("fluture");

describe("Unit Tests - FTP"), function() {
    describe("SendFile", function() {
        it("should return a future", function() {

            const fakeConnectionConfig = {
                "host" : "",
                "port" : 1,
                "remoteFilePath" : "",
                "user" : "",
                "password" : ""
            };
            //         host: $.String, port: $.NonNegativeInteger, remoteFilePath: $.String, user: $.String, password: $.String


            expect(ftp.SendFile("", fakeConnectionConfig)).to.be.instanceOf(Future);
        });
    });
}