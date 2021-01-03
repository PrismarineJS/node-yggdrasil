'use strict'
const Client = require('./Client')
const Server = require('./Server')
const Yggdrasil = function (options) {
  return Object.assign({}, Client, options)
}
Yggdrasil.server = function (options) {
  return Object.assign({}, Server, options)
}
module.exports = Yggdrasil
