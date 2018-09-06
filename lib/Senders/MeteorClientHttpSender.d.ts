/** global: HTTP, Meteor */
import { ISender } from "./ISender";
/**
 * MeteorClientHttpSender send data from the client to the server over HTTP.
 */
declare class MeteorClientHttpSender implements ISender {
    loggerUrl: string;
    http: typeof HTTP;
    requestHeaders: {
        [key: string]: string;
    };
    /**
     * @constructor
     *
     * @param {String} loggerUrl
     *   The absolute URL of the logger server. Usually /logger on the Meteor app.
     */
    constructor(loggerUrl: string);
    /** @inheritDoc */
    send(level: number, message: string, context: object): void;
}
export { MeteorClientHttpSender, };
