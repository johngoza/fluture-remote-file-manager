// const Client = require("ftp");
// const crypto = require("crypto");
// const fs = require("fs");
// const S = require("sanctuary");
// const {fork} = require("fluture");
// const {getFileMetadata, filterFileMetadata, verifyFile} = require("../../../lib/ftp");

// const connectionConfig = {
//   "host": "localhost",
//   "port": 21,
//   "user": "user",
//   "password": "password",
//   "remoteFileName": "hello.txt",
//   "remoteDirectory": "/",
// };

// const fileList = [
//   {
//     "type": "-",
//     "name": "hello.txt",
//   },
//   {
//     "type": "d",
//     "name": "home",
//   },
// ];

// const writeStream = fs.createWriteStream("helloooo.txt");

// fork
// (console.log)
// (stream => {
//   console.log("data");
//   stream.pipe(writeStream);
// })
// (verifyFile(new Client())(connectionConfig));
