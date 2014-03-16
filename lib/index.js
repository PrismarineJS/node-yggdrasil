/* jshint node: true */
"use strict";
var request = require('request');
var uuid = require('uuid');
var version = require('../package.json').version;

module.exports = function Yggdrasil (con) {
  var config = {
    host : con.host || "https://authserver.mojang.com" //Allow for a custom auth server
  };
  
  var request = require('request').defaults({
    headers: {
      "User-Agent" : "node-yggdrasil/" + version,
      "Content-Type" : "application/json"
    }
  });

  var r = {};
  r._call = function (path, data, cb) {
    request({
      method: 'POST',
      uri: config.host + "/" + path,
      json: data
    }, function (err, resp, body) {
      if (body && body.error) {
        var out = body.errorMessage;
        out.status = resp.statusCode;
        cb(out);
      } else {
        cb(err, body);
      }
    });
  };

  /**
   * Attempts to authenticate a user.
   * @param  {Object}   options Config object
   * @param  {Function} cb      Callback
   */
  r.auth = function (options, cb) {
    if (options.token === null) {
      delete options.token;
    } else {
      options.token = options.token || uuid.v4();
    }
    
    options.agent = options.agent || "Minecraft";
    r._call('authenticate', {
      agent : {
        name: options.agent,
        version : options.agent === "Minecraft" ? 1 : options.version
      },
      username: options.user,
      password: options.pass,
      clientToken: options.token
    }, function (err, data) {
      cb(err, data);
    });
  };

  /**
   * Refreshes a accessToken.
   * @param  {String}   access Old Access Token
   * @param  {String}   client Client Token
   * @param  {Function} cb     (err, new token)
   */
  r.refresh = function (access, client, cb) {
    r._call('refresh', {
      accessToken: access,
      clientToken: client
    }, function (err, data) {
      if (data.clientToken !== client) {
        cb("clientToken assertion failed");
      } else {
        cb(null, data.accessToken);
      }
    });
  };

  /**
   * Validates an access token
   * @param  {String}   token Token to validate
   * @param  {Function} cb    (is okay, error)
   */
  r.validate = function (token, cb) {
    r._call('validate', {
      accessToken: token
    }, function (err, data) {
      if (err) {
        cb(false, err);
      } else {
        cb(true);
      }
    });
  };
  /**
   * Invalidates all access tokens.
   * @param  {String}   user User's user
   * @param  {String}   pass User's pass
   * @param  {Function} cb   (worked, error)
   */
  r.signout = function (user, pass, cb) {
    r._call('signout', {
      username: user,
      password: pass
    }, function (err, data) {
      if (err) {
        cb(false, err);
      } else {
        cb(true);
      }
    });
  };

  return r;
};