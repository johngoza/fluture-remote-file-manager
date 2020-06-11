const fs = require("fs");
const SMTPServer = require("smtp-server").SMTPServer;

const writeStream = fs.createWriteStream("/dev/null");

const server = new SMTPServer({
  onAuth(auth, session, callback) {
    if (auth.username !== "user" || auth.password !== "password") {
      return callback(new Error("Invalid username or password"));
    }
    callback(null, {"user": 123});
  },
  onData(stream, session, callback) {
    // this is required to close the connection
    // since stream.destroy() does not work here for some reason
    stream.pipe(writeStream);

    stream.on("end", () => {
      callback(null, "accepted");
      server.close(() => {});
    });
  },
});

server.listen(587);
