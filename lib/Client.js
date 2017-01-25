'use strict'

var uuid = require('uuid')
var utils = require('./utils')

var Client = function (options) {
  this.host = options.host || 'https://authserver.mojang.com'
}

/**
 * Attempts to authenticate a user.
 * @param  {Object}   options Config object
 * @param  {Function} cb      Callback
 */
Client.prototype.auth = function (options, cb) {
  if (options.token === null) {
    delete options.token
  } else {
    options.token = options.token || uuid.v4()
  }

  options.agent = options.agent || 'Minecraft'
  utils.call(this.host, 'authenticate', {
    agent: {
      name: options.agent,
      version: options.agent === 'Minecraft' ? 1 : options.version
    },
    username: options.user,
    password: options.pass,
    clientToken: options.token
  }, function (err, data) {
    cb(err, data)
  })
}

/**
 * Refreshes a accessToken.
 * @param  {String}   access Old Access Token
 * @param  {String}   client Client Token
 * @param  {Function} cb     (err, new token, full response body)
 */
Client.prototype.refresh = function (access, client, cb) {
  utils.call(this.host, 'refresh', {
    accessToken: access,
    clientToken: client
  }, function (err, data) {
    if (err) cb(err)
    if (data && data.clientToken !== client) {
      cb(new Error('clientToken assertion failed'))
    } else {
      cb(err, data ? data.accessToken : null, data)
    }
  })
}

/**
 * Validates an access token
 * @param  {String}   token Token to validate
 * @param  {Function} cb    (error)
 */
Client.prototype.validate = function (token, cb) {
  utils.call(this.host, 'validate', {
    accessToken: token
  }, function (err, data) {
    cb(err)
  })
}
/**
 * Invalidates all access tokens.
 * @param  {String}   user User's user
 * @param  {String}   pass User's pass
 * @param  {Function} cb   (error)
 */
Client.prototype.signout = function (user, pass, cb) {
  utils.call(this.host, 'signout', {
    username: user,
    password: pass
  }, function (err, data) {
    cb(err)
  })
}

module.exports = Client
