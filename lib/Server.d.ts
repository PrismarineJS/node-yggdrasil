declare const Server: {
  join(
    token: String,
    profile: String,
    serverid: String,
    sharedsecret: String,
    serverkey: String,
    cb: (err?: Error, data?: any) => any
  ): void;
  hasJoined(
    username: String,
    serverid: String,
    sharedsecret: String,
    serverkey: String,
    cb: (err?: Error, body?: any) => any
  ): void;
};
export default Server;
