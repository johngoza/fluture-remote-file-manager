const {def, EmailConfig, EmailType, ReadStreamType} = require("../lib/sanctuary-environment");
const Future = require("fluture");
const {FutureType} = require("fluture-sanctuary-types");
const $ = require("sanctuary-def");

const sendFileViaEmail =
  def("sendFileViaEmail")
  ({})
  ([EmailType, ReadStreamType, EmailConfig, FutureType($.String)($.String)])
  (client => readStream => transportConfiguration => Future((reject, resolve) => {
    const transport = client.createTransport(transportConfiguration);

    const message = transportConfiguration.message;
    message.attachments = [{
      "filename": transportConfiguration.remoteFilePath,
      "content": readStream,
    }];

    transport.sendMail(message, (err, info) => {
      if (err) reject(err);

      resolve(info);
    });

    return () => {};
  }));

module.exports = {
  sendFileViaEmail,
};
