/**
 * @fileOverview Syslog Sender class.
 */
import modernSyslog = require("modern-syslog");
import { ISendContext } from "../ISendContext";
import * as LogLevel from "../LogLevel";
declare type Serializer = (doc: object) => string;
interface ISyslogContext {
    message: string;
    level: LogLevel.Levels;
    facility?: modernSyslog.facility;
    context?: ISendContext;
}
/**
 * SyslogSender sends messages to a syslog server.
 *
 * It does not check the length of the message, which is limited do 1kB in
 * legacy RFC3164 syslog implementations, and could be limited to 2kB in
 * RFC5424 and/or RFC6587 implementations.
 *
 * @see https://tools.ietf.org/html/rfc3164#section-4.1
 * @see https://tools.ietf.org/html/rfc5424#section-6.1
 * @see https://tools.ietf.org/html/rfc6587#section-3.4.1
 *
 * @extends SenderBase
 */
declare const SyslogSender: {
    new (ident: null | undefined, syslogOptions: number | undefined, syslogFacility: number | null | undefined, syslog: any, formatOptions?: null, serialize?: null): {
        facility: number;
        formatOptions: object;
        ident: string;
        option: number;
        serialize: Serializer;
        syslog: any;
        /**
         * @inheritDoc
         */
        send(level: number, message: string, context: ISendContext): void;
        /**
         * Serialize a message to JSON. Handles circular documents with a fallback.
         *
         * @param doc
         * - an object with 3 mandatory keys and an optional one:
         *   - message: a string or object, as per Meteor Log package
         *   - level: a numeric severity level, like modernSyslog.level.LOG_DEBUG
         *   - facility: a syslog facility, like modernSyslog.facility.LOG_LOCAL0
         *   - (Optional) context: an object of context values. Anything goes.
         *
         * @returns
         *   The serialized version of the doc argument under the formatOptions rules.
         */
        serializeDefault(doc: ISyslogContext): string;
        /**
         * Serialize a message to Node.js util.inspect format.
         *
         * @param doc
         *   A document to serialize. Any structure.
         *
         * @returns
         *   The serialized version of the doc argument under the formatOptions rules.
         */
        serializeInspect(doc: object): string;
    };
};
export default SyslogSender;
