// const crypto = require("crypto");
// const R = require("ramda");
// const SftpClient = require("ssh2").Client;
//
// const connectionConfig = {
//   "host": "localhost",
//   "port": 22,
//   "user": "user",
//   "password": "password",
// };
//
// const client = new SftpClient();
//
// client.on("error", (err) => {
//   client.end();
//   throw err;
// });
//
// client.on("ready", () => {
//   client.sftp((err, sftp) => {
//     if (err) {
//       client.end();
//       throw err;
//     }
//
//     sftp.readdir("/home/user/", function(err, list) {
//       if (err) throw err;
//
//       const filtered = R.filter(x => x.filename === "hello.txt", list);
//       console.log(filtered);
//
//       const hasher = crypto.createHash("md5");
//       const hashed = hasher.update(filtered.toString()).digest("hex");
//       console.log(hashed);
//       client.end();
//     });
//   });
// });
//
// client.connect(connectionConfig);

// const S = require("sanctuary");
// const {fork, chain, reject, resolve} = require("fluture");
//
// const example = chain(S.either(reject)(resolve))(resolve(S.Right(42)));
//
// fork
// (console.log)
// (console.log)
// (example);
