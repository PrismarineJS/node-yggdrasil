/* jshint node: true, expr: true */
var crypto = require('crypto');
var should = require('should');
var nock = require('nock');

var scope = nock('https://authserver.mojang.com');
var ygg = require('../lib/index')({});

describe ('Yggdrasil', function () {
  describe('_call', function () {
    it ('should work when given valid data', function (done) {
      var bsdata = {
        cake: true,
        username: "someone"
      };
      scope.post('/test', {}).reply(200, bsdata);
      ygg._call('test', {}, function (err, data) {
        should(err).be.undefined;
        data.should.eql(bsdata);
        done();
      });
    });
    it ('should error on an error', function (done) {
      scope.post('/test2', {}).reply(200, {
        error: "ThisBeAError",
        errorMessage: "Yep, you failed."
      });
      ygg._call('test2', {}, function (err, data) {
        should(data).be.undefined;
        err.should.equal("Yep, you failed.");
        done();
      });
    });
  });
  describe('auth', function () {
    it ('should work correctly', function (done) {
      scope.post('/authenticate', {
        agent: {
          version: 1,
          name: "Minecraft"
        },
        username: "cake",
        password: "hunter2",
        clientToken: "bacon"
      }).reply(200, {
        worked: true
      });
      ygg.auth({
        user: "cake",
        pass: "hunter2",
        token: "bacon"
      }, function (err, data) {
        data.should.eql({
          worked: true
        });
        done();
      });
    });
  });
  describe ('refresh', function () {
    it ('should work correctly', function (done) {
      scope.post('/refresh', {
        accessToken: "bacon",
        clientToken: "not bacon"
      }).reply(200, {
        accessToken: "different bacon",
        clientToken: "not bacon"
      });
      ygg.refresh("bacon", "not bacon", function (err, token) {
        should(err).be.undefined;
        token.should.equal("different bacon");
        done();
      });
    });
    it ('should error on invalid clientToken', function (done) {
      scope.post('/refresh', {
        accessToken: "bacon",
        clientToken: "not bacon"
      }).reply(200, {
        accessToken: "different bacon",
        clientToken: "bacon"
      });
      ygg.refresh("bacon", "not bacon", function (err, token) {
        should(token).be.undefined;
        err.should.equal("clientToken assertion failed");
        done();
      });
    });
  });
  describe ('validate', function () {
    it ('should return true on valid response', function (done) {
      scope.post('/validate', {
        accessToken: "a magical key"
      }).reply(200);
      ygg.validate("a magical key", function (okay, err) {
        okay.should.be.true;
        should(err).be.undefined;
        done();
      });
    });
    it ('should return false on an error', function (done) {
      scope.post('/validate', {
        accessToken: "a magical key"
      }).reply(403, {
        error: "UserEggError",
        errorMessage: "User is an egg"
      });
      ygg.validate("a magical key", function (okay, err) {
        okay.should.be.false;
        err.should.equal("User is an egg");
        done();
      });
    });
  });
  afterEach(function () {
    scope.done();
  });
});

var sscope = nock('https://sessionserver.mojang.com');
var yggserver = require('../lib/index').server({});


describe ('Yggdrasil.server', function () {
  //mcHexDigest(sha1('catcatcat')) => -af59e5b1d5d92e5c2c2776ed0e65e90be181f2a
  describe('_call', function () {
    it ('should work when given valid data', function (done) {
      var bsdata = {
        cake: true,
        username: "someone"
      };
      sscope.post('/test', {}).reply(200, bsdata);
      yggserver._call('test', {}, function (err, data) {
        should(err).be.undefined;
        data.should.eql(bsdata);
        done();
      });
    });
    it ('should error on an error', function (done) {
      sscope.post('/test2', {}).reply(200, {
        error: "ThisBeAError",
        errorMessage: "Yep, you failed."
      });
      yggserver._call('test2', {}, function (err, data) {
        should(data).be.undefined;
        err.should.equal("Yep, you failed.");
        done();
      });
    });
  });

  describe('mcHexDigest', function() {
    it ('should work against test data', function() {
      //circa http://wiki.vg/Protocol_Encryption#Client
      var testdata = {
        'Notch': '4ed1f46bbe04bc756bcb17c0c7ce3e4632f06a48',
        'jeb_': '-7c9d5b0044c130109a5d7b5fb5c317c02b4e28c1',
        'simon': '88e16a1019277b15d58faf0541e11910eb756f6'
      };
      Object.keys(testdata).forEach(function(name){
        var hash = crypto.createHash('sha1').update(name).digest();
        yggserver.mcHexDigest(hash).should.equal(testdata[name]);
      });
    });
  });

  describe('join', function () {
    it ('should work correctly', function (done) {
      sscope.post('/session/minecraft/join', {
        "accessToken": 'anAccessToken',
        "selectedProfile": 'aSelectedProfile',
        "serverId": '-af59e5b1d5d92e5c2c2776ed0e65e90be181f2a'
      }).reply(200, {
        worked: true
      });
      
      yggserver.join("anAccessToken", "aSelectedProfile", "cat", "cat", "cat", function (err, data) {
        data.should.eql({
          worked: true
        });
        done();
      });
    });
  });

  describe('hasJoined', function () {
    it ('should work correctly', function(done) {
      sscope.get('/session/minecraft/hasJoined?username=ausername&serverId=-af59e5b1d5d92e5c2c2776ed0e65e90be181f2a').reply(200, {
        id: 'cat',
        worked: true
      });
      
      yggserver.hasJoined("ausername", "cat", "cat", "cat", function (err, data) {
        if (err) return done(err);
        data.should.eql({
          id: 'cat',
          worked: true
        });
        done();
      });
    });
    it ('should fail on a 200 empty response', function(done) {
      sscope.get('/session/minecraft/hasJoined?username=ausername&serverId=-af59e5b1d5d92e5c2c2776ed0e65e90be181f2a').reply(200);
      
      yggserver.hasJoined("ausername", "cat", "cat", "cat", function (err, data) {
        err.should.be.an.Error;
        done();
      });
    });
  });
  afterEach(function () {
    scope.done();
  });
});