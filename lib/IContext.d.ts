/**
 * @fileOverview
 * Basic data structures used during logging.
 */
declare const KEY_DETAILS = "message_details";
declare const KEY_HOST = "hostname";
declare const KEY_SOURCE = "source";
declare const KEY_TS = "timestamp";
/**
 * The data accompanying a log event.
 *
 * - KEY_DETAILS: the details passed to the log() call by the application.
 * - KEY_HOST: the host on which a hostname could first be found. This is
 *   usually the hostname of the Meteor server handling the request.
 * - KEY_SOURCE: the source of the log event. In normal usage, it will be one of
 *   "client", "cordova", or "server", but can be any other string and tests,
 *   especially are expected to make use of other values.
 * - KEY_TS: the timestamps chain taken while handling the log event.
 * - "side" keys represent the additional context data added by processors on
 *   each side in a log chain.
 *
 * In practice, this means that log events emitted on a browser or mobile app
 * will have two such keys: one for the source of the event ("client" or
 * "cordova"), and one ("server") for the context added by the server handling
 * the logging. Conversely, log events emitted on the server, e.g. during
 * startup or a Meteor method call, will only have context added under the
 * "server" key.
 */
interface IContext {
    [KEY_DETAILS]?: IDetails;
    [KEY_HOST]?: string;
    [KEY_SOURCE]?: string;
    [KEY_TS]?: ITimestamps;
    [side: string]: {} | undefined;
}
/**
 * The type of data passed along the level and message in ILogger.log() calls.
 *
 * It is expected to mostly contain values for placeholders in the string
 * representation of the message, in PSR-3 format (braces).
 *
 * @see IContext
 */
interface IDetails {
    [key: string]: any;
}
/**
 * The time of the data under the KEY_TS in IContext.
 *
 * Its structure allows the conservation or relative time sequence on different
 * hosts in a client->server or mobile->server chain by segregating timestamps
 * by side performing the timestamping, avoiding issues with time drift in
 * loosely coordinated hosts.
 *
 * @see IContext
 */
interface ITimestamps {
    [side: string]: {
        [op: string]: number;
    };
}
export { IContext, IDetails, ITimestamps, KEY_DETAILS, KEY_HOST, KEY_SOURCE, KEY_TS, };
