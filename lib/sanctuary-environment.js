const $ = require("sanctuary-def");
const {"env": F$} = require("fluture-sanctuary-types");
const def = $.create ({"checkTypes": true, "env": $.env.concat(F$)});

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
  "connect": $.AnyFunction,
  "on": $.AnyFunction,
  "put": $.AnyFunction,
  "end": $.AnyFunction,
});

const SshType = $.NamedRecordType
("Ssh")
("https://www.npmjs.com/package/ssh2")
([])
({
  "on": $.AnyFunction,
  "sftp": $.AnyFunction,
  "connect": $.AnyFunction,
  "end": $.AnyFunction,
});

const ReadStreamType = $.NamedRecordType
("ReadableStream")
("https://nodejs.org/api/stream.html#stream_readable_streams")
([])
({
  "pipe": $.Any,
});

module.exports = {
  def,
  ConnectionConfig,
  FtpType,
  ReadStreamType,
  SshType,
};
