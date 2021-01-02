declare const utils: {
  phin: any;
  /**
   * Generic POST request
   */
  call(host: any, path: any, data: any, agent: any, cb: any): void;
  /**
   * Java's stupid hashing method
   */
  mcHexDigest(hash: Buffer | String, encoding: String): String;
};
export default utils;
