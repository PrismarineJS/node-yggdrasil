/* jshint node: true, expr: true */
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