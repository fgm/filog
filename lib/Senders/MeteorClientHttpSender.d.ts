/** global: HTTP, Meteor */
/**
 * MeteorClientHttpSender send data from the client to the server over HTTP.
 *
 * @extends SenderBase
 */
declare const MeteorClientHttpSender: {
    new (loggerUrl: string): {
        http: typeof HTTP;
        requestHeaders: {
            [key: string]: string;
        };
        loggerUrl: string;
        /** @inheritDoc */
        send(level: number, message: string, context: object): void;
    };
};
export default MeteorClientHttpSender;
