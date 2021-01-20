import { Agent } from 'http'
import nf from 'node-fetch'

const { version } = require('../package.json'); // eslint-disable-line

const headers = {
  'User-Agent': `node-yggdrasil/${version as string}`,
  'Content-Type': 'application/json'
}

const utils = {
  /**
   * Generic POST request
   */
  call: async function (host: string, path: string, data: any, agent: Agent | undefined) {
    const resp = await nf(`${host}/${path}`, { agent, body: JSON.stringify(data), headers, method: 'POST' })
    let body: string | any = await resp.text()
    if (body.length === 0) return ''
    try {
      body = JSON.parse(body)
    } catch (e) {
      if (e instanceof SyntaxError) {
        if (resp.status === 403) {
          if ((body as string).includes('Request blocked.')) {
            throw new Error('Request blocked by CloudFlare')
          }
          if ((body as string).includes('cf-error-code">1009')) {
            throw new Error('Your IP is banned by CloudFlare')
          }
        } else {
          throw new Error(`Response is not JSON. Status code: ${resp.status ?? 'no status code'}`)
        }
      } else {
        throw e
      }
    }
    if (body?.error !== undefined) throw new Error(body?.errorMessage)
    return body
  },
  /**
   * Java's stupid hashing method
   * @param  {Buffer|String} hash     The hash data to stupidify
   * @param  {String} encoding Optional, passed to Buffer() if hash is a string
   * @return {String}          Stupidified hash
   */
  mcHexDigest: function (hash: Buffer | String, encoding?: String): any {
    if (!(hash instanceof Buffer)) {
      hash = (Buffer as any).from(hash, encoding)
    }
    // check for negative hashes
    const negative = (hash as any).readInt8(0) < 0
    if (negative) performTwosCompliment(hash)
    return (negative ? '-' : '') + hash.toString('hex').replace(/^0+/g, '')
  },

  callbackify: function (f: any, maxParams: number) {
    return function (...args: any[]) {
      let cb: Function | undefined
      let i: number = args.length
      while (cb === undefined && i > 0) {
        if (typeof args[i - 1] === 'function') {
          cb = args[i - 1]
          args[i - 1] = undefined
          args[maxParams] = cb
          break
        }
        i--
      }
      return f(...args).then(
        (r: any) => {
          if (r[0] !== undefined) {
            cb?.(undefined, ...r)
            return r[r.length - 1]
          } else {
            cb?.(undefined, r)
            return r
          }
        },
        (err: unknown) => {
          if (typeof cb === 'function') cb(err)
          else throw err
        }
      )
    }
  }
}

/**
 * Java's annoying hashing method.
 * All credit to andrewrk
 * https://gist.github.com/andrewrk/4425843
 */
function performTwosCompliment (buffer: any): void {
  let carry = true
  let i, newByte, value
  for (i = buffer.length - 1; i >= 0; --i) {
    value = buffer.readUInt8(i)
    newByte = ~value & 0xff
    if (carry) {
      carry = newByte === 0xff
      buffer.writeUInt8(carry ? 0 : newByte + 1, i)
    } else {
      buffer.writeUInt8(newByte, i)
    }
  }
}

utils.call = utils.callbackify(utils.call, 4)

export = utils
