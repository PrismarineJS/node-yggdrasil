declare const Client: {
    /**
     * Attempts to authenticate a user.
     * @param  {Object}   options Config object
     * @param  {Function} cb      Callback
     */
    auth: (options: any, cb?: ((err: Error | undefined, data?: Object | undefined) => void) | undefined) => Promise<any>;
    /**
     * Refreshes a accessToken.
     * @param  {String}   access Old Access Token
     * @param  {String}   client Client Token
     * @param  {String=false}   requestUser Whether to request the user object
     * @param  {Function} cb     (err, new token, full response body)
     */
    refresh: (access: string, client: string, requestUser: boolean | Function, cb?: ((err: Error | undefined, data?: Object | undefined) => void) | undefined) => Promise<any>;
    /**
     * Validates an access token
     * @param  {String}   token Token to validate
     * @param  {Function} cb    (error)
     */
    validate: (token: string, cb?: ((err: Error | undefined, data?: Object | undefined) => void) | undefined) => Promise<unknown>;
    /**
     * Invalidates all access tokens.
     * @param  {String}   user User's user
     * @param  {String}   pass User's pass
     * @param  {Function} cb   (error)
     */
    signout: (user: string, pass: string, cb?: ((err: Error | undefined, data?: Object | undefined) => void) | undefined) => Promise<unknown>;
};
export = Client;
