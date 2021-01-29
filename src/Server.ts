import { createHash } from 'crypto'
import utils from './utils.js'
import nf from 'node-fetch'
import type { Agent } from 'http'

const defaultHost = 'https://sessionserver.mojang.com'

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
  join: async function (accessToken: string, selectedProfile: string, serverid: string, sharedsecret: string, serverkey: string) {
    return await utils.call(
      (this as any)?.host as string ??
      defaultHost,
      'session/minecraft/join',
      {
        accessToken,
        selectedProfile,
        serverId: utils.mcHexDigest(createHash('sha1').update(serverid).update(sharedsecret).update(serverkey).digest())
      },
      (this as any)?.agent as Agent
    )
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
  hasJoined: async function (username: string, serverid: string, sharedsecret: string, serverkey: string) {
    const host: string = (this as any)?.host as string ?? defaultHost
    const hash: string = utils.mcHexDigest(createHash('sha1').update(serverid).update(sharedsecret).update(serverkey).digest())
    const data = await nf(`${host}/session/minecraft/hasJoined?username=${username}&serverId=${hash}`, { agent: (this as any)?.agent as Agent, method: 'GET' })
    const body = JSON.parse(await data.text())
    if (body.id !== undefined) return body
    else throw new Error('Failed to verify username!')
  }
}

Server.join = utils.callbackify(Server.join, 5)
Server.hasJoined = utils.callbackify(Server.hasJoined, 4)

export = Server
