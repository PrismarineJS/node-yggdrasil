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
  auth: async function (options: any) {
    if (options.token === null) delete options.token;
    else options.token = options.token || uuid.v4();

    options.agent = options.agent || "Minecraft";

    return utils.call(
      this?.host || defaultHost,
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
    );
  },
  /**
   * Refreshes a accessToken.
   * @param  {String}   accessToken Old Access Token
   * @param  {String}   clientToken Client Token
   * @param  {String=false}   requestUser Whether to request the user object
   * @param  {Function} cb     (err, new token, full response body)
   */
  refresh: async function (
    accessToken: string,
    clientToken: string,
    requestUser?: boolean
  ) {
    let data = await utils.call(
      this?.host || defaultHost,
      "refresh",
      { accessToken, clientToken, requestUser: !!requestUser },
      this?.agent
    );
    if (data.clientToken !== clientToken)
      throw new Error("clientToken assertion failed");
    return [data.accessToken, data];
  },
  /**
   * Validates an access token
   * @param  {String}   accessToken Token to validate
   * @param  {Function} cb    (error)
   */
  validate: async function (accessToken: string) {
    return utils.call(
      this?.host || defaultHost,
      "validate",
      { accessToken },
      this?.agent
    );
  },

  /**
   * Invalidates all access tokens.
   * @param  {String}   username User's user
   * @param  {String}   password User's pass
   * @param  {Function} cb   (error)
   */
  signout: async function (username: string, password: string) {
    return utils.call(
      this?.host || defaultHost,
      "signout",
      { username, password },
      this?.agent
    );
  },
};

Client.auth = utils.callbackify(Client.auth, 1);
Client.refresh = utils.callbackify(Client.refresh, 3);
Client.signout = utils.callbackify(Client.signout, 1);
Client.validate = utils.callbackify(Client.validate, 2);

export = Client;
