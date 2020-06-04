const {def, EmailConfig, EmailClientType, ReadStreamType} = require("../lib/sanctuary-environment");
const Future = require("fluture");
const {FutureType} = require("fluture-sanctuary-types");
const $ = require("sanctuary-def");

const sendFileViaEmail =
  def("sendFileViaEmail")
  ({})
  ([EmailClientType, ReadStreamType, EmailConfig, FutureType($.String)($.String)])
  (client => readStream => transportConfiguration => Future((reject, resolve) => {
    const transport = client.createTransport(transportConfiguration);

    const message = transportConfiguration.message;
    message.attachments = [{
      "filename": transportConfiguration.remoteFilePath,
      "content": readStream,
    }];

    transport.sendMail(message, (err, res) => {
      if (err) reject(err.code.toString() + " " + err.message.toString());

      resolve(res);
    });

    return () => {};
  }));

module.exports = {
  sendFileViaEmail,
};
