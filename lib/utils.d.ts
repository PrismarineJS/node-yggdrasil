/// <reference types="node" />
declare const utils: {
    phin: typeof import("phin");
    /**
     * Generic POST request
     */
    call: (host: string, path: string, data: any, agent: any, cb?: ((err: Error | undefined, data?: Object | undefined) => void) | undefined) => Promise<any>;
    /**
     * Java's stupid hashing method
     * @param  {Buffer|String} hash     The hash data to stupidify
     * @param  {String} encoding Optional, passed to Buffer() if hash is a string
     * @return {String}          Stupidified hash
     */
    mcHexDigest: (hash: Buffer | String, encoding?: String | undefined) => any;
};
export = utils;
