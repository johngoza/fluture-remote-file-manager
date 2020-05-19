const chai = require("chai");
const expect = chai.expect;
const ftp = require("ftp");
const { fork } = require("fluture");
const path = require("path");
const Readable = require('stream').Readable;
const { setupDocker, tearDownDocker } = require("./docker-setup");
const { sendFileViaFtp } = require(path.join(__dirname, "../../../lib/ftp.js"))

const cleanUpFtp = ftpClient => {
    ftpClient.on("ready", function () {
        ftpClient.delete("/ftp/user/some_file.txt", (err) => {
            throw err;
        });
    });

    const connectionConfig = {
        "host": "ftp-server",
        "port": 21,
        "remoteFilePath": "/ftp/user/some_file.txt",
        "user": "user",
        "password": "password"
    };

    ftpClient.connect(connectionConfig);
}

describe("SYSTEM TESTS - ftp.js", function () {
    describe("sendFileViaFtp", function () {
        before(function (done) {
            // setupDocker();
            done();
        });

        it("should put a file on an ftp server", function (done) {
            this.timeout(30000);

            const connectionConfig = {
                "host": "ftp-server",
                "port": 21,
                "remoteFilePath": "/ftp/user/some_file.txt",
                "user": "user",
                "password": "password"
            };

            const readable = new Readable();
            readable.push("hello world");
            readable.push(null);

            const verifyResults = (ftpClient, data, expected) => {
                expect(data).to.deep.equal("Upload successful");

                ftpClient.on("ready", function () {
                    ftpClient.get(connectionConfig.remoteFilePath, (err, stream) => {
                        if (err) throw err;

                        let chunks = [];

                        stream.on('data', chunk => chunks.push(chunk));
                        stream.on('end', () => {
                            const actualReadable = new Readable();
                            actualReadable._read = () => { }; // _read is required but you can noop it
                            actualReadable.push(Buffer.concat(chunks).toString('utf-8'));
                            actualReadable.push(null);

                            expect(actualReadable).to.deep.equal(expected);
                        });
                    });
                });

                ftpClient.connect(connectionConfig);
            }

            fork
                (done)
                (data => {
                    const ftpClient = new ftp();
                    verifyResults(ftpClient, data, readable);
                    ftpClient.end();
                    done();
                })
                (sendFileViaFtp(new ftp())(readable)(connectionConfig))
        });

        it("should reject if the server throws an error", function (done) {
            // we don't allow anonymous login
            const connectionConfig = {
                "host": "ftp-server",
                "port": 21,
                "remoteFilePath": "/ftp/user/some_file.txt",
                "user": "user",
                "password": "password"
            };

            const readable = new Readable();
            readable.push("hello world");
            readable.push(null);

            fork
                (err => {
                    expect(err).to.deep.equal('Upload failed: Error: Permission denied.')
                    done();
                })
                (done)
                (sendFileViaFtp(new ftp())(readable)(connectionConfig))
        });

        after(function () {
            // const ftpForTeardown = new ftp();
            // cleanUpFtp(ftpForTeardown);
            // ftpForTeardown.end();
            // tearDownDocker();
        });

    });
});