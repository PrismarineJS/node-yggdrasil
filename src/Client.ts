import uuiddef from "uuid";
import utilsdef from "./utils.js";

const uuid: typeof uuiddef = require("uuid");
const utils: typeof utilsdef = require("./utils.js");

const defaultHost = "https://authserver.mojang.com";

const Client = {
  /**
   * Attempts to authenticate a user.
   * @param  {Object}   options Config object
   * @param  {Function} cb      Callback
   */
  auth: async function (
    options: any,
    cb?: (err: Error | undefined, data?: Object) => void
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const host = options.host || defaultHost;

      if (options.token === null) {
        delete options.token;
      } else {
        options.token = options.token || uuid.v4();
      }
      options.agent = options.agent || "Minecraft";

      utils
        .call(
          host,
          "authenticate",
          {
            agent: {
              name: options.agent,
              version: options.agent === "Minecraft" ? 1 : options.version,
            },
            username: options.user,
            password: options.pass,
            clientToken: options.token,
            requestUser: options.requestUser === true,
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
   * Refreshes a accessToken.
   * @param  {String}   access Old Access Token
   * @param  {String}   client Client Token
   * @param  {String=false}   requestUser Whether to request the user object
   * @param  {Function} cb     (err, new token, full response body)
   */
  refresh: async function (
    access: string,
    client: string,
    requestUser: boolean | Function,
    cb?: (err: Error | undefined, data?: Object) => void
  ): Promise<any> {
    return new Promise(function (resolve, reject) {
      if (typeof requestUser === "function") {
        (cb as any) = requestUser;
        requestUser = false;
      }
      const host = this?.host || defaultHost;
      utils
        .call(
          host,
          "refresh",
          {
            accessToken: access,
            clientToken: client,
            requestUser: !!requestUser,
          },
          this?.agent
        )
        .then((data) => {
          if (data?.clientToken !== client) {
            reject(new Error("clientToken assertion failed"));
            cb?.(new Error("clientToken assertion failed"), data);
          } else {
            resolve(data);
            (cb as any)?.(undefined, data ? data.accessToken : null, data);
          }
        })
        .catch((err) => {
          reject(err);
          cb?.(err);
        });
    });
  },
  /**
   * Validates an access token
   * @param  {String}   token Token to validate
   * @param  {Function} cb    (error)
   */
  validate: async function (
    token: string,
    cb?: (err: Error | undefined, data?: Object) => void
  ) {
    return new Promise(function (resolve, reject) {
      const host = this?.host || defaultHost;
      utils
        .call(
          host,
          "validate",
          {
            accessToken: token,
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
   * Invalidates all access tokens.
   * @param  {String}   user User's user
   * @param  {String}   pass User's pass
   * @param  {Function} cb   (error)
   */
  signout: async function (
    user: string,
    pass: string,
    cb?: (err: Error | undefined, data?: Object) => void
  ) {
    return new Promise(function (resolve, reject) {
      const host = this?.host || defaultHost;
      utils
        .call(
          host,
          "signout",
          {
            username: user,
            password: pass,
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
};

export = Client;
