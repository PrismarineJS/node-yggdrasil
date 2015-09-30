# yggdrasil
[![Build Status](http://img.shields.io/travis/zekesonxx/node-yggdrasil.svg)](https://travis-ci.org/zekesonxx/node-yggdrasil)

A Node.js client for doing requests to yggdrasil, the Mojang authentication system, used for Minecraft and Scrolls.
There's already one other client out there (at the time of writing) but I don't like it, so I wrote this one.

# Usage
    $ npm install yggdrasil

## Client
```js
//init
var ygg = require('yggdrasil')({
  //Optional settings object
  host: 'https://authserver.mojang.com' //Optional custom host. No trailing slash.
});

//Authenticate a user
ygg.auth({
  token: '', //Optional. Client token.
  agent: '', //Agent name. Defaults to 'Minecraft'
  version: 1, //Agent version. Defaults to 1
  user: '', //Username
  pass: '' //Password
}, function(err, data){});

//Refresh an accessToken
ygg.refresh(oldtoken, clienttoken, function(err, newtoken, response body){});

//Validate an accessToken
ygg.validate(token, function(isvalid, err){});

//Invalidate all accessTokens
ygg.signout(username, password, function(worked, err));
```

## Server
```js
var yggserver = require('yggdrasil').server({
  //Optional settings object
  host: 'https://authserver.mojang.com' //Optional custom host. No trailing slash.
});

//Join a server (clientside)
yggserver.join(token, profile, serverid, sharedsecret, serverkey, function(err, response body){});

//Join a server (serverside)
yggserver.join(username, serverid, sharedsecret, serverkey, function(err, client info){});
```


# Further Reading
* [Authentication protocol documentation](http://wiki.vg/Authentication)
* [node-minecraft-protocol](https://github.com/PrismarineJS/node-minecraft-protocol), a Minecraft client and server in Node.js
* [prismarine-yggdrasil](https://github.com/PrismarineJS/prismarine-yggdrasil), another yggdrasil client that node-yggdrasil [will be replacing](https://github.com/PrismarineJS/prismarine-yggdrasil/issues/2).