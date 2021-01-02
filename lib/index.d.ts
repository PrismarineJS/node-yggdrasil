import Client from "./Client";
import Server from "./Server";

declare const Yggdrasil: {
  (options: any): typeof Client;
  server(options: any): typeof Server;
};
export default Yggdrasil;
