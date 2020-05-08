const $ = require('sanctuary-def');
const { env: F$ } = require('fluture-sanctuary-types')

// FtpConnectionConfig :: Type
// host - string, port - integer, secure - unknown, secureOptions - object/unknown
// user - string, password - string, connTimeout - integer, pasvtimeout - integer, keepalive - integer
// only enforce required vars here. if someone wants to pass timeout values more power to em
const FtpConnectionConfig =
    $.RecordType({
        host: $.String, port: $.NonNegativeInteger, remoteFilePath: $.String, user: $.String, password: $.String
    });

// hasMethod :: String -> a -> Boolean
const hasMethod = name => x => x != null && typeof x[name] == 'function';

// const FtpLibrary = $.TypeClass

//    env :: Array Type
const env = $.env.concat([FtpConnectionConfig, F$]);
const def = $.create({
    checkTypes: process.env.NODE_ENV === 'development',
    env,
});

module.exports = {
    FtpConnectionConfig,
    def
}