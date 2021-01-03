const Client = require("./Client");
const Server = require("./Server");

const Yggdrasil = function (options?: any): typeof Client {
  return Object.assign({}, Client, options);
};

Yggdrasil.server = function (options?: any): typeof Server {
  return Object.assign({}, Server, options);
};

export = Yggdrasil;
