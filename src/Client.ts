import uuid from 'uuid'
import * as utils from './utils.js'
import type { Agent } from 'http'

const defaultHost = 'https://authserver.mojang.com'

const Client = {
  /**
   * Attempts to authenticate a user.
   * @param  {Object}   options Config object
   * @param  {Function} cb      Callback
   */
  auth: async function (options: { agent?: string, user: string, pass: string, token?: string, version: string, requestUser?: boolean }) {
    if (options.token === null) delete options.token
    else options.token = options.token ?? uuid.v4()

    options.agent = options.agent ?? 'Minecraft'

    return await utils.call(
      (this as any)?.host as string ?? defaultHost,
      'authenticate',
      {
        agent: {
          name: options.agent,
          version: options.agent === 'Minecraft' ? 1 : options.version
        },
        username: options.user,
        password: options.pass,
        clientToken: options.token,
        requestUser: options.requestUser === true
      },
      (this as any)?.agent as Agent
    )
  },
  /**
   * Refreshes a accessToken.
   * @param  {String}   accessToken Old Access Token
   * @param  {String}   clientToken Client Token
   * @param  {String=false}   requestUser Whether to request the user object
   * @param  {Function} cb     (err, new token, full response body)
   */
  refresh: async function (accessToken: string, clientToken: string, requestUser?: boolean) {
    const data = await utils.call((this as any)?.host as string ?? defaultHost, 'refresh', { accessToken, clientToken, requestUser: requestUser ?? false }, (this as any)?.agent as Agent)
    if (data.clientToken !== clientToken) throw new Error('clientToken assertion failed')
    return [data.accessToken, data]
  },
  /**
   * Validates an access token
   * @param  {String}   accessToken Token to validate
   * @param  {Function} cb    (error)
   */
  validate: async function (accessToken: string) {
    return await utils.call((this as any)?.host as string ?? defaultHost, 'validate', { accessToken }, (this as any)?.agent as Agent)
  },

  /**
   * Invalidates all access tokens.
   * @param  {String}   username User's user
   * @param  {String}   password User's pass
   * @param  {Function} cb   (error)
   */
  signout: async function (username: string, password: string) {
    return await utils.call((this as any)?.host as string ?? defaultHost, 'signout', { username, password }, (this as any)?.agent as Agent)
  }
}

Client.auth = utils.callbackify(Client.auth, 1)
Client.refresh = utils.callbackify(Client.refresh, 3)
Client.signout = utils.callbackify(Client.signout, 1)
Client.validate = utils.callbackify(Client.validate, 2)

export = Client
