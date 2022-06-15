## History

## 1.7.1
* Add optional field ip to yggserver#hasJoined to allow for optionally checking if user's login ip matches with ip authenticated through Mojang's servers

## 1.7.0
* Add new endpoint to invalidate all accessTokens using current valid accessToken and clientToken
* Fixed "call" function throwing an empty error message

## 1.6.1
* Properly escape the username

## 1.6.0
* move back to js

## 1.5.2
* Fix the release

## 1.5.0
* Add async support and typings with typescript and convert to node-fetch (thanks @Rob9315)

## 1.4.0
* Add ability to request user from token refresh (thanks @ph0t0shop)

## 1.3.0
- improve code (@IdanHo)
- add proxy support (@IdanHo)

## 1.2.0
- Fix phin error handler @rom1504
- Handle CloudFlare errors @wvffle
