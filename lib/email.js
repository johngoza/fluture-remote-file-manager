const $ = require("sanctuary-def");
const Future = require("fluture");
const R = require("ramda");
const {def, EmailConfig, EmailClientType, ReadStreamType} = require("../lib/sanctuary-environment");
const {FutureType} = require("fluture-sanctuary-types");

const sendFileViaEmail =
  def("sendFileViaEmail")
  ({})
  ([EmailClientType, ReadStreamType, EmailConfig, FutureType($.String)($.String)])
  (client => readStream => transportConfiguration => Future((reject, resolve) => {
    const transport = client.createTransport(transportConfiguration);

    const message = transportConfiguration.message;
    message.attachments = [{
      "filename": transportConfiguration.remoteFileName,
      "content": readStream,
    }];

    transport.sendMail(message, (err, res) => {
      transport.close();
      R.isNil(err)
        ? resolve(res)
        : reject(err.code.toString() + " " + err.message.toString());
    });

    return () => {};
  }));

module.exports = {
  sendFileViaEmail,
};
