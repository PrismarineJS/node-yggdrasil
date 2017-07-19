/* eslint-env mocha */
'use strict'

var crypto = require('crypto')
var should = require('should')
var nock = require('nock')

var utils = require('../lib/utils')

describe('utils', function () {
  describe('call', function () {
    var google = 'https://google.com'
    var uscope = nock(google)

    it('should work when given valid data', function (done) {
      var bsdata = {
        cake: true,
        username: 'someone'
      }
      uscope.post('/test', {}).reply(200, bsdata)
      utils.call(google, 'test', {}, function (err, data) {
        should(err).be.undefined
        data.should.eql(bsdata)
        done()
      })
    })

    it('should error on an error', function (done) {
      uscope.post('/test2', {}).reply(200, {
        error: 'ThisBeAError',
        errorMessage: 'Yep, you failed.'
      })
      utils.call(google, 'test2', {}, function (err, data) {
        should(data).be.undefined
        err.should.be.an.instanceOf(Error)
        err.message.should.equal('Yep, you failed.')
        done()
      })
    })

    afterEach(function () {
      uscope.done()
    })
  })

  // mcHexDigest(sha1('catcatcat')) => -af59e5b1d5d92e5c2c2776ed0e65e90be181f2a
  describe('mcHexDigest', function () {
    it('should work against test data', function () {
      // circa http://wiki.vg/Protocol_Encryption#Client
      var testdata = {
        'Notch': '4ed1f46bbe04bc756bcb17c0c7ce3e4632f06a48',
        'jeb_': '-7c9d5b0044c130109a5d7b5fb5c317c02b4e28c1',
        'simon': '88e16a1019277b15d58faf0541e11910eb756f6',
        'dummy697': '-aa2358520428804697026992cf6035d7f096a00' // triggers 2's complement bug
      }
      Object.keys(testdata).forEach(function (name) {
        var hash = crypto.createHash('sha1').update(name).digest()
        utils.mcHexDigest(hash).should.equal(testdata[name])
      })
    })

    it('should handle negative hashes ending with a zero byte without crashing', function () {
      utils.mcHexDigest(Buffer([-1, 0])).should.equal('-100')
    })
  })
})

var cscope = nock('https://authserver.mojang.com')
var ygg = require('../lib/index')({})

describe('Yggdrasil', function () {
  describe('auth', function () {
    it('should work correctly', function (done) {
      cscope.post('/authenticate', {
        agent: {
          version: 1,
          name: 'Minecraft'
        },
        username: 'cake',
        password: 'hunter2',
        clientToken: 'bacon',
        requestUser: false
      }).reply(200, {
        worked: true
      })
      ygg.auth({
        user: 'cake',
        pass: 'hunter2',
        token: 'bacon'
      }, function (err, data) { // eslint-disable-line handle-callback-err
        data.should.eql({
          worked: true
        })
        done()
      })
    })
    it('should work correctly with requestUser true', function (done) {
      cscope.post('/authenticate', {
        agent: {
          version: 1,
          name: 'Minecraft'
        },
        username: 'cake',
        password: 'hunter2',
        clientToken: 'bacon',
        requestUser: true
      }).reply(200, {
        worked: true
      })
      ygg.auth({
        user: 'cake',
        pass: 'hunter2',
        token: 'bacon',
        requestUser: true
      }, function (err, data) { // eslint-disable-line handle-callback-err
        data.should.eql({
          worked: true
        })
        done()
      })
    })
  })
  describe('refresh', function () {
    it('should work correctly', function (done) {
      cscope.post('/refresh', {
        accessToken: 'bacon',
        clientToken: 'not bacon'
      }).reply(200, {
        accessToken: 'different bacon',
        clientToken: 'not bacon'
      })
      ygg.refresh('bacon', 'not bacon', function (err, token) {
        should(err).be.undefined
        token.should.equal('different bacon')
        done()
      })
    })
    it('should error on invalid clientToken', function (done) {
      cscope.post('/refresh', {
        accessToken: 'bacon',
        clientToken: 'not bacon'
      }).reply(200, {
        accessToken: 'different bacon',
        clientToken: 'bacon'
      })
      ygg.refresh('bacon', 'not bacon', function (err, token) {
        should(token).be.undefined
        err.should.be.an.instanceOf(Error)
        err.message.should.equal('clientToken assertion failed')
        done()
      })
    })
  })
  describe('validate', function () {
    it('should return undefined on valid response', function (done) {
      cscope.post('/validate', {
        accessToken: 'a magical key'
      }).reply(200)
      ygg.validate('a magical key', function (err) {
        should(err).be.undefined
        done()
      })
    })
    it('should return Error on error', function (done) {
      cscope.post('/validate', {
        accessToken: 'a magical key'
      }).reply(403, {
        error: 'UserEggError',
        errorMessage: 'User is an egg'
      })
      ygg.validate('a magical key', function (err) {
        err.should.be.an.instanceOf(Error)
        err.message.should.equal('User is an egg')
        done()
      })
    })
  })
  afterEach(function () {
    cscope.done()
  })
})

var sscope = nock('https://sessionserver.mojang.com')
var yggserver = require('../lib/index').server({})

describe('Yggdrasil.server', function () {
  describe('join', function () {
    it('should work correctly', function (done) {
      sscope.post('/session/minecraft/join', {
        'accessToken': 'anAccessToken',
        'selectedProfile': 'aSelectedProfile',
        'serverId': '-af59e5b1d5d92e5c2c2776ed0e65e90be181f2a'
      }).reply(200, {
        worked: true
      })

      yggserver.join('anAccessToken', 'aSelectedProfile', 'cat', 'cat', 'cat', function (err, data) { // eslint-disable-line handle-callback-err
        data.should.eql({
          worked: true
        })
        done()
      })
    })
  })

  describe('hasJoined', function () {
    it('should work correctly', function (done) {
      sscope.get('/session/minecraft/hasJoined?username=ausername&serverId=-af59e5b1d5d92e5c2c2776ed0e65e90be181f2a').reply(200, {
        id: 'cat',
        worked: true
      })

      yggserver.hasJoined('ausername', 'cat', 'cat', 'cat', function (err, data) {
        if (err) return done(err)
        data.should.eql({
          id: 'cat',
          worked: true
        })
        done()
      })
    })
    it('should fail on a 200 empty response', function (done) {
      sscope.get('/session/minecraft/hasJoined?username=ausername&serverId=-af59e5b1d5d92e5c2c2776ed0e65e90be181f2a').reply(200)

      yggserver.hasJoined('ausername', 'cat', 'cat', 'cat', function (err, data) {
        err.should.be.an.instanceOf(Error)
        done()
      })
    })
  })
  afterEach(function () {
    sscope.done()
  })
})
