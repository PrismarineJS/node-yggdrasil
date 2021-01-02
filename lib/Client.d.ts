declare const Client: {
  auth(
    options: {
      token?: String;
      agent?: String;
      user: String;
      pass: String;
      requestUser?: boolean;
    },
    cb: (err?: Error, data?: any) => any
  ): void;
  refresh(
    access: String,
    client: String,
    requestUser: any,
    cb: (err?: Error, data?: any) => any
  ): void;
  validate(token: String, cb: (err?: Error) => any): void;
  signout(user: String, pass: String, cb: (err?: Error) => any): void;
};
export default Client;
