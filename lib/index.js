'use strict'

/**
 * Shim the library to make the API 100% backwards compatible with the old version.
 */

var Client = require('./Client')
var Server = require('./Server')

var Yggdrasil = function (options) {
  return Object.assign({}, Client, options)
}

Yggdrasil.server = function (options) {
  return Object.assign({}, Server, options)
}

module.exports = Yggdrasil
