import cryptodef from "crypto";
import utilsdef from "./utils.js";

const crypto: typeof cryptodef = require("crypto");
const utils: typeof utilsdef = require("./utils");

const defaultHost = "https://sessionserver.mojang.com";

const Server = {
  /**
   * Client's Mojang handshake call
   * See http://wiki.vg/Protocol_Encryption#Client
   * @param  {String}   token        Client's accessToken
   * @param  {String}   profile      Client's selectedProfile
   * @param  {String}   serverid     ASCII encoding of the server ID
   * @param  {String}   sharedsecret Server's secret string
   * @param  {String}   serverkey    Server's encoded public key
   * @param  {Function} cb           (is okay, data returned by server)
   * @async
   */
  join: async function (
    token: string,
    profile: string,
    serverid: string,
    sharedsecret: string,
    serverkey: string,
    cb?: (err: Error | undefined, data?: Object) => void
  ) {
    return new Promise(function (this: any, resolve, reject) {
      const host = this?.host || defaultHost;
      utils
        .call(
          host,
          "session/minecraft/join",
          {
            accessToken: token,
            selectedProfile: profile,
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
        )
        .then((data) => {
          resolve(data);
          cb?.(undefined, data);
        })
        .catch((err) => {
          reject(err);
          cb?.(err);
        });
    });
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
    serverkey: string,
    cb?: (err: Error | undefined, data?: Object) => void
  ) {
    return new Promise(function (this: any, resolve, reject) {
      const host = this?.host || defaultHost;
      const hash = utils.mcHexDigest(
        crypto
          .createHash("sha1")
          .update(serverid)
          .update(sharedsecret)
          .update(serverkey)
          .digest()
      );
      utils
        .phin({
          url: `${host}/session/minecraft/hasJoined?username=${username}&serverId=${hash}`,
          core: {
            agent: this?.agent,
          },
        })
        .then(function (this: any, data: any) {
          let body, err;
          try {
            body = JSON.parse(data.body.toString());
          } catch (caughtErr) {
            err = caughtErr;
          }
          if (err) {
            reject(err);
            cb?.(err);
          } else {
            if (body?.id) {
              resolve(body);
              cb?.(undefined, body);
            } else {
              reject(new Error("Failed to verify username!"));
              cb?.(new Error("Failed to verify username!"));
            }
          }
        });
    });
  },
};

export = Server;
