const FtpClient = require("ftp");
const SftpClient = require("ssh2").Client;
const {sendFileViaFtp} = require("./ftp");
const {sendFileViaSftp} = require("./sftp");

const sendFunctions = {
  "ftp": {
    "method": sendFileViaFtp,
    "client": new FtpClient(),
  },
  "sftp": {
    "method": sendFileViaSftp,
    "client": new SftpClient(),
  },
};

// check for "ready"-ness
// make it a future that rejects or resolves (resolve w/ ready stream)

// readStream.on("error", (err) => {
//   reject("Unable to read file. " + err.code.toString() + " " + err.message.toString());
// });
const createReadStream = (fs, fileName) => {
  return fs.createReadStream(fileName);
};

module.exports = {
  createReadStream,
  sendFunctions,
};
