const { createHash } = require('crypto')
const utils = require('./utils')
const nf = require('node-fetch')

const defaultHost = 'https://sessionserver.mojang.com'

function loader (moduleOptions) {
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
  async function join (accessToken, selectedProfile, serverid, sharedsecret, serverkey) {
    return await utils.call(
      moduleOptions?.host ??
      defaultHost,
      'session/minecraft/join',
      {
        accessToken,
        selectedProfile,
        serverId: utils.mcHexDigest(createHash('sha1').update(serverid).update(sharedsecret).update(serverkey).digest())
      },
      moduleOptions?.agent
    )
  }

  /**
   * Server's Mojang handshake call
   * @param  {String}   username     Client's username, case-sensitive
   * @param  {String}   serverid     ASCII encoding of the server ID
   * @param  {String}   sharedsecret Server's secret string
   * @param  {String}   serverkey    Server's encoded public key
   * @param  {Function} cb           (is okay, client info)
   * @param  {String}   ip           (optional) The ip field is optional and when present should be the IP address of the connecting player; checks ip against authentication server
   * @async
   */
  async function hasJoined (username, serverid, sharedsecret, serverkey, ip) {
    const host = moduleOptions?.host ?? defaultHost
    const hash = utils.mcHexDigest(createHash('sha1').update(serverid).update(sharedsecret).update(serverkey).digest())
    const data = await nf(`${host}/session/minecraft/hasJoined?username=${encodeURIComponent(username)}&serverId=${hash}${ip ? `&ip=${ip}` : ''}`, { agent: moduleOptions?.agent, method: 'GET' })
    const body = JSON.parse(await data.text())
    if (body.id !== undefined) return body
    else throw new Error('Failed to verify username!')
  }

  return {
    join: utils.callbackify(join, 5),
    hasJoined: utils.callbackify(hasJoined, 4)
  }
}

module.exports = loader
