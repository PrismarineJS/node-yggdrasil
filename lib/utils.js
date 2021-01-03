'use strict'
const phin = require('phin').promisified
const utils = {
  phin: phin,
  /**
     * Generic POST request
     */
  call: async function (host, path, data, agent, cb) {
    return new Promise((resolve, reject) => {
      phin({
        method: 'POST',
        url: `${host}/${path}`,
        data,
        headers,
        core: { agent }
      })
        .then((resp) => {
          if (resp.body.length === 0) {
            resolve('')
            cb?.(undefined, '')
          } else {
            let body, err
            try {
              body = JSON.parse(resp.body)
            } catch (caughtErr) {
              if (caughtErr instanceof SyntaxError) {
                // Probably a cloudflare error page
                const body = resp.body.toString()
                if (resp.statusCode === 403) {
                  if (/Request blocked\./.test(body)) {
                    err = new Error('Request blocked by CloudFlare')
                  }
                  if (/cf-error-code">1009/.test(body)) {
                    err = new Error('Your IP is banned by CloudFlare')
                  }
                } else {
                  err = new Error('Response is not JSON. Status code: ' + resp.statusCode)
                  err.code = resp.statusCode
                }
              } else {
                err = caughtErr
              }
            }
            if (body && body.error) {
              reject(new Error(body.errorMessage))
              cb?.(new Error(body.errorMessage))
            } else {
              resolve(body)
              cb?.(undefined, body)
            }
          }
        })
        .catch((err) => {
          reject(err)
          cb?.(err)
        })
    })
  },
  /**
     * Java's stupid hashing method
     * @param  {Buffer|String} hash     The hash data to stupidify
     * @param  {String} encoding Optional, passed to Buffer() if hash is a string
     * @return {String}          Stupidified hash
     */
  mcHexDigest: function (hash, encoding) {
    if (!(hash instanceof Buffer)) {
      hash = Buffer.from(hash, encoding)
    }
    // check for negative hashes
    const negative = hash.readInt8(0) < 0
    if (negative) { performTwosCompliment(hash) }
    return (negative ? '-' : '') + hash.toString('hex').replace(/^0+/g, '')
  }
}
const version = require('../package.json').version
const headers = {
  'User-Agent': 'node-yggdrasil/' + version,
  'Content-Type': 'application/json'
}
/**
 * Java's annoying hashing method.
 * All credit to andrewrk
 * https://gist.github.com/andrewrk/4425843
 */
function performTwosCompliment (buffer) {
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
module.exports = utils
