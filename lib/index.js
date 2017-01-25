'use strict'

var Client = require('./Client')
var Server = require('./Server')

var Yggdrasil = function (options) {
  return Object.assign({}, Client, options)
}

Yggdrasil.server = function (options) {
  return Object.assign({}, Server, options)
}

module.exports = Yggdrasil
