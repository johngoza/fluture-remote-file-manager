const simpleParser = require("mailparser").simpleParser;
const SMTPServer = require("smtp-server").SMTPServer;

const server = new SMTPServer({
  onAuth(auth, session, callback) {
    if (auth.username !== "user" || auth.password !== "password") {
      return callback(new Error("Invalid username or password"));
    }
    callback(null, {"user": 123});
  },
  onData(stream, session, callback) {
    simpleParser(stream, (err, mail) => {
      if (err) callback(err);

      let attachmentBody;
      try {
        attachmentBody = mail.attachments[0].content.toString();
        callback(null, attachmentBody);
      } catch (e) {
        callback(e);
      }

      server.close(() => {});
    });
  },
});

server.listen(587);
