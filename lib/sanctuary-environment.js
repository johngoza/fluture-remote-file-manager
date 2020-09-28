const $ = require("sanctuary-def");
const {"env": F$} = require("fluture-sanctuary-types");
const def = $.create ({"checkTypes": true, "env": $.env.concat(F$)});

// Base configuration object
const ConnectionConfig =
    $.RecordType({
      "host": $.String,
      "port": $.NonNegativeInteger,
      "remoteFilePath": $.String,
    });

const ReadStreamType = $.NamedRecordType
("ReadableStream")
("https://nodejs.org/api/stream.html#stream_readable_streams")
([])
({
  "pipe": $.Any,
});

const Email =
  $.RecordType({
    "to": $.String,
    "from": $.String,
    "subject": $.String,
    "text": $.String,
  });

const EmailAuth =
  $.RecordType({
    "user": $.String,
    "pass": $.String,
  });

const EmailConfig =
  $.NamedRecordType
  ("EmailConfig")
  ("string")
  ([ConnectionConfig])
  ({
    "auth": EmailAuth,
    "message": Email,
  });

// External Library Types
const EmailClientType = $.NamedRecordType
("NodeMailer")
("https://www.npmjs.com/package/nodemailer")
([])
({
  "createTransport": $.AnyFunction,
});

const FtpClientType = $.NamedRecordType
("Ftp")
("https://www.npmjs.com/package/ftp")
([])
({
  "connect": $.AnyFunction,
  "get": $.AnyFunction,
  "on": $.AnyFunction,
  "put": $.AnyFunction,
  "end": $.AnyFunction,
});

const SshClientType = $.NamedRecordType
("Ssh")
("https://www.npmjs.com/package/ssh2")
([])
({
  "on": $.AnyFunction,
  "sftp": $.AnyFunction,
  "connect": $.AnyFunction,
  "end": $.AnyFunction,
});

module.exports = {
  ConnectionConfig,
  def,
  EmailConfig,
  EmailClientType,
  FtpClientType,
  ReadStreamType,
  SshClientType,
};
