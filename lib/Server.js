'use strict'

var crypto = require('crypto')
var utils = require('./utils')

var Server = {}

var defaultHost = 'https://sessionserver.mojang.com'

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
Server.join = function (token, profile, serverid, sharedsecret, serverkey, cb) {
  var host = this.host || defaultHost
  utils.call(host, 'session/minecraft/join', {
    'accessToken': token,
    'selectedProfile': profile,
    'serverId': utils.mcHexDigest(crypto.createHash('sha1').update(serverid).update(sharedsecret).update(serverkey).digest())
  }, function (err, data) {
    cb(err, data)
  })
}

/**
 * Server's Mojang handshake call
 * @param  {String}   username     Client's username, case-sensitive
 * @param  {String}   serverid     ASCII encoding of the server ID
 * @param  {String}   sharedsecret Server's secret string
 * @param  {String}   serverkey    Server's encoded public key
 * @param  {Function} cb           (is okay, client info)
 * @async
 */
Server.hasJoined = function (username, serverid, sharedsecret, serverkey, cb) {
  var host = this.host || defaultHost
  var hash = utils.mcHexDigest(crypto.createHash('sha1').update(serverid).update(sharedsecret).update(serverkey).digest())
  utils.phin(host + '/session/minecraft/hasJoined?username=' + username + '&serverId=' + hash, function (err, resp) {
    try {
      var body = JSON.parse(resp.body.toString())
    } catch (caughtErr) {
      err = caughtErr
    }
    if (err || body && body.hasOwnProperty('id')) {
      cb(err, body)
    } else {
      cb(new Error('Failed to verify username!'))
    }
  })
}

module.exports = Server
