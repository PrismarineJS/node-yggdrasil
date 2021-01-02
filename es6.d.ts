interface authOptions{
  token?: String,
  agent?: String,
  user: String,
  pass: String,
  requestUser?: boolean
}

export const Client: {
  auth(options: authOptions, cb: (err?: Error, data?: any)=>any): void
  refresh(access: String, client: String, requestUser: any, cb: (err?:Error, data?:any)=>any): void
  validate(token: String, cb: (err?:Error)=>any): void
  signout(user: String, pass: String, cb: (err?:Error)=>any): void
}

export const Server: {
  join(token: String, profile: String, serverid: String, sharedsecret: String, serverkey: String, cb: (err?:Error, data?:any)=>any): void
  hasJoined(username: String, serverid: String, sharedsecret: String, serverkey: String, cb: (err?:Error, body?:any)=>any): void
}