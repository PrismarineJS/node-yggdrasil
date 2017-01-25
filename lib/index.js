'use strict'

var Client = require('./Client')
var Server = require('./Server')

var Yggdrasil = function (options) {
  return new Client(options)
}

Yggdrasil.server = function (options) {
  return new Server(options)
}

module.exports = Yggdrasil
