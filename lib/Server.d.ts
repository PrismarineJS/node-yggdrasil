declare const Server: {
    /**
     * Client's Mojang handshake call
     * See http://wiki.vg/Protocol_Encryption#Client
     * @param  {String}   token        Client's accessToken
     * @param  {String}   profile      Client's selectedProfile
     * @param  {String}   serverid     ASCII encoding of the server ID
     * @param  {String}   sharedsecret Server's secret string
     * @param  {String}   serverkey    Server's encoded public key
     * @param  {Function} cb           (is okay, data returned by server)
     * @async
     */
    join: (token: string, profile: string, serverid: string, sharedsecret: string, serverkey: string, cb?: ((err: Error | undefined, data?: Object | undefined) => void) | undefined) => Promise<unknown>;
    /**
     * Server's Mojang handshake call
     * @param  {String}   username     Client's username, case-sensitive
     * @param  {String}   serverid     ASCII encoding of the server ID
     * @param  {String}   sharedsecret Server's secret string
     * @param  {String}   serverkey    Server's encoded public key
     * @param  {Function} cb           (is okay, client info)
     * @async
     */
    hasJoined: (username: string, serverid: string, sharedsecret: string, serverkey: string, cb?: ((err: Error | undefined, data?: Object | undefined) => void) | undefined) => Promise<unknown>;
};
export = Server;
