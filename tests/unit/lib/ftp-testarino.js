const Client = require("ftp");
const crypto = require("crypto");
const R = require("ramda");


const connectionConfig = {
  "host": "localhost",
  "port": 21,
  "user": "user",
  "password": "password",
};

const c = new Client();
c.on("ready", function() {
  c.list("/ftp/user", function(err, list) {
    if (err) throw err;
    // console.dir(list);

    const filtered = R.filter(x => x.name === "hello.txt", list);
    console.log(filtered);

    const hasher = crypto.createHash("md5");
    const hashed = hasher.update(filtered.toString()).digest("hex");
    console.log(hashed);
    c.end();
  });
});

c.connect(connectionConfig);
