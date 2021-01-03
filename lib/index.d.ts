declare const Client: any;
declare const Server: any;
declare const Yggdrasil: {
    (options?: any): typeof Client;
    server(options?: any): typeof Server;
};
export = Yggdrasil;
