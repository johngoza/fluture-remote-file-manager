const {exec, execSync, spawn} = require("child_process");
const options = { encoding: "utf-8" };

let containerId;

const setupDocker = () => {
  const dockerVersion = execSync("docker version", options);
  if (!dockerVersion.includes("Server: Docker Engine") || !dockerVersion.includes("Client: Docker Engine")) {
    throw "Docker misconfigured";
  }

  const imageList = execSync("docker images ftp-test", options);
  if (!imageList.includes("latest")) {
    console.log("ftp-test image not found; building a new one");

    // this is a potentially slow command and requires an internet connection.
    execSync("docker build tests/system/resources -t ftp-test", options);
  }

  const runningContainers = execSync("docker container ls", options);
  if (!runningContainers.includes("ftp-test")) {
    containerId = execSync("docker run -d -p 21:21 -p 21000-21010:21000-21010 ftp-test", options);
  }
}

const tearDownDocker = () => {
  console.log(containerId);
  execSync("docker kill " + containerId);
  // execSync("docker ps -q --filter ancestor=ftp-test", options);
}

module.exports = {
  setupDocker,
  tearDownDocker
}
