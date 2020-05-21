const $ = require('sanctuary-def');
const { env: F$ } = require('fluture-sanctuary-types')

// readStream needs to be defined.
// https://nodejs.org/api/fs.html#fs_fs_createreadstream_path_options

// FTP needs to be defined
// https://www.npmjs.com/package/ftp

// FtpConnectionConfig :: Type
// host - string, port - integer, secure - unknown, secureOptions - object/unknown
// user - string, password - string, connTimeout - integer, pasvtimeout - integer, keepalive - integer
// only enforce required vars here. if someone wants to pass timeout values more power to em
const FtpConnectionConfig =
    $.RecordType({
        host: $.String, port: $.NonNegativeInteger, remoteFilePath: $.String, user: $.String, password: $.String
    });

// const FtpLibrary = $.TypeClass

// env :: Array Type
const def = $.create({
    checkTypes: process.env.NODE_ENV === 'development',
    env: $.env.concat(F$, FtpConnectionConfig)
});

module.exports = {
    FtpConnectionConfig,
    def
}