const $ = require("sanctuary-def");
const {"env": F$} = require("fluture-sanctuary-types");

// ConnectionConfig :: Type
// host - string, port - integer, secure - unknown, secureOptions - object/unknown
// user - string, password - string, connTimeout - integer, pasvtimeout - integer, keepalive - integer
// only enforce required vars here. if someone wants to pass timeout values more power to em
const ConnectionConfig =
    $.RecordType({
      "host": $.String,
      "port": $.NonNegativeInteger,
      "remoteFilePath": $.String,
      "user": $.String,
    });

const FtpType = $.NamedRecordType
("Ftp")
("https://www.npmjs.com/package/ftp")
([])
({
  "connect": $.Function([ConnectionConfig]),
  "on": $.Function([$.String, $.AnyFunction]),
  "put": $.Function([$.Unknown, $.String, $.AnyFunction]),
  "end": $.Function([$.Void]),
});

const SshType = $.NamedRecordType
("Ssh")
("https://www.npmjs.com/package/ssh2")
([])
({
  "on": $.Function([$.String, $.AnyFunction]),
  "sftp": $.Function([$.AnyFunction]),
  "connect": $.Function([ConnectionConfig]),
  "end": $.Function([$.Void]),
});

const ReadStreamType = $.NamedRecordType
("ReadableStream")
("https://nodejs.org/api/stream.html#stream_readable_streams")
([])
({
  "pipe": $.Function([$.AnyFunction]),
});

const def = $.create({
  "checkTypes": process.env.NODE_ENV === "development",
  "env": $.env.concat(
    F$,
    ConnectionConfig,
    FtpType,
    ReadStreamType,
    SshType
  ),
});

module.exports = {
  def,
  ConnectionConfig,
  FtpType,
  ReadStreamType,
  SshType,
};
