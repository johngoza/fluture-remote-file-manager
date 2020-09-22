// todo: uncomment all this once ftps tests are fixed

// const chai = require("chai");
// const expect = chai.expect;
// const fs = require("fs");
// const path = require("path");
// const {fork} = require("fluture");
// const {getFile, sendFile} = require(path.join(__dirname, "../../../index"));
//
// describe("SYSTEM TESTS - sftp.js", function() {
//   describe("sendFileViaSftp", function() {
//     it("should put a file on an sftp server that uses key auth", function(done) {
//       const privateKey = fs.readFileSync("tests/system/resources/sftp/host_id_rsa");
//
//       const connectionConfig = {
//         "host": "sftp-server",
//         "port": 22,
//         "remoteDirectory": "/",
//         "remoteFileName": "some_file.txt",
//         "user": "user",
//         "privateKey": privateKey,
//       };
//
//       const filepath = "tests/system/resources/hello.txt";
//
//       fork
//       (err => {
//         done(err);
//       })
//       (data => {
//         expect(data).to.deep.equal("Upload successful");
//         done();
//       })
//       (sendFile("sftp")(connectionConfig)(filepath));
//     });
//
//     it("should put a file on an sftp server that uses password auth", function(done) {
//       const connectionConfig = {
//         "host": "sftp-server",
//         "port": 22,
//         "remoteDirectory": "/",
//         "remoteFileName": "some_file.txt",
//         "user": "user",
//         "password": "password",
//       };
//
//       const filepath = "tests/system/resources/hello.txt";
//
//       fork
//       (err => {
//         done(err);
//       })
//       (data => {
//         expect(data).to.deep.equal("Upload successful");
//         done();
//       })
//       (sendFile("sftp")(connectionConfig)(filepath));
//     });
//
//     it("should fail with a descriptive message if there is an error", function(done) {
//       // anonymous login not allowed in test sftp server
//       const connectionConfig = {
//         "host": "sftp-server",
//         "port": 22,
//         "remoteDirectory": "/",
//         "remoteFileName": "some_file.txt",
//         "user": "",
//         "password": "",
//       };
//
//       const filepath = "tests/system/resources/hello.txt";
//
//       fork
//       (err => {
//         expect(err.message).to.contain("All configured authentication methods failed");
//         done();
//       })
//       (done)
//       (sendFile("sftp")(connectionConfig)(filepath));
//     });
//   });
//
//   describe("getFile", function() {
//     it("should get a file on an sftp server that uses password auth", function(done) {
//       const connectionConfig = {
//         "host": "sftp-server",
//         "port": 22,
//         "remoteDirectory": "/home/user",
//         "remoteFileName": "hello.txt",
//         "user": "user",
//         "password": "password",
//       };
//
//       fork
//       (err => {
//         done(err);
//       })
//       (data => {
//         let result = "";
//
//         data.on("data", function(d) {
//           result += d.toString();
//         });
//
//         data.on("end", function() {
//           expect(result).to.deep.equal("hello world");
//           done();
//         });
//       })
//       (getFile("sftp")(connectionConfig));
//     });
//
//     it("should get a file on an sftp server that uses key auth", function(done) {
//       const privateKey = fs.readFileSync("tests/system/resources/sftp/host_id_rsa");
//
//       const connectionConfig = {
//         "host": "sftp-server",
//         "port": 22,
//         "remoteDirectory": "/home/user/",
//         "remoteFileName": "hello.txt",
//         "user": "user",
//         "privateKey": privateKey,
//       };
//
//       fork
//       (err => {
//         done(err);
//       })
//       (data => {
//         let result = "";
//
//         data.on("data", function(d) {
//           result += d.toString();
//         });
//
//         data.on("end", function() {
//           expect(result).to.deep.equal("hello world");
//           done();
//         });
//       })
//       (getFile("sftp")(connectionConfig));
//     });
//
//     it("should fail with a descriptive message if there is an error", function(done) {
//       // anonymous login not allowed in test sftp server
//       const connectionConfig = {
//         "host": "sftp-server",
//         "port": 22,
//         "remoteDirectory": "/",
//         "remoteFileName": "some_file.txt",
//         "user": "",
//         "password": "",
//       };
//
//       fork
//       (err => {
//         expect(err.message).to.contain("All configured authentication methods failed");
//         done();
//       })
//       (done)
//       (getFile("sftp")(connectionConfig));
//     });
//   });
// });
