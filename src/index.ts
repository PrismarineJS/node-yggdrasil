import Client from './Client'
import Server from './Server'

const Yggdrasil = function (options?: { defaultHost: string }): typeof Client {
  return Object.assign({}, Client, options)
}

Yggdrasil.server = function (options?: { defaultHost: string }): typeof Server {
  return Object.assign({}, Server, options)
}

export = Yggdrasil
