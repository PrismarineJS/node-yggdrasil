import cryptodef from "crypto";
import utilsdef from "./utils.js";

const crypto: typeof cryptodef = require("crypto");
const utils: typeof utilsdef = require("./utils");

const defaultHost = "https://sessionserver.mojang.com";

const Server = {
  /**
   * Client's Mojang handshake call
   * See http://wiki.vg/Protocol_Encryption#Client
   * @param  {String}   accessToken        Client's accessToken
   * @param  {String}   selectedProfile      Client's selectedProfile
   * @param  {String}   serverid     ASCII encoding of the server ID
   * @param  {String}   sharedsecret Server's secret string
   * @param  {String}   serverkey    Server's encoded public key
   * @param  {Function} cb           (is okay, data returned by server)
   * @async
   */
  join: async function (
    accessToken: string,
    selectedProfile: string,
    serverid: string,
    sharedsecret: string,
    serverkey: string
  ) {
    return utils.call(
      this?.host || defaultHost,
      "session/minecraft/join",
      {
        accessToken,
        selectedProfile,
        serverId: utils.mcHexDigest(
          crypto
            .createHash("sha1")
            .update(serverid)
            .update(sharedsecret)
            .update(serverkey)
            .digest()
        ),
      },
      this?.agent
    );
  },

  /**
   * Server's Mojang handshake call
   * @param  {String}   username     Client's username, case-sensitive
   * @param  {String}   serverid     ASCII encoding of the server ID
   * @param  {String}   sharedsecret Server's secret string
   * @param  {String}   serverkey    Server's encoded public key
   * @param  {Function} cb           (is okay, client info)
   * @async
   */
  hasJoined: async function (
    username: string,
    serverid: string,
    sharedsecret: string,
    serverkey: string
  ) {
    const host = this?.host || defaultHost;
    const hash = utils.mcHexDigest(
      crypto
        .createHash("sha1")
        .update(serverid)
        .update(sharedsecret)
        .update(serverkey)
        .digest()
    );
    let data = await utils.phin({
      url: `${host}/session/minecraft/hasJoined?username=${username}&serverId=${hash}`,
      core: { agent: this?.agent },
    });
    let body = JSON.parse(data.body.toString());
    if (body.id) return body;
    else throw new Error("Failed to verify username!");
  },
};

Server.join = utils.callbackify(Server.join, 5);
Server.hasJoined = utils.callbackify(Server.hasJoined, 4);

export = Server;
