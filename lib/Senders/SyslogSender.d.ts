/**
 * @fileOverview Syslog Sender class.
 */
import modernSyslog = require("modern-syslog");
import { IContext } from "../IContext";
import * as LogLevel from "../LogLevel";
import { ISender } from "./ISender";
declare type Serializer = (doc: object) => string;
interface ISyslogContext {
    message: string;
    level: LogLevel.Levels;
    facility?: modernSyslog.facility;
    context?: IContext;
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
 */
declare class SyslogSender implements ISender {
    syslog: any;
    facility: number;
    formatOptions: object;
    ident: string;
    option: number;
    serialize: Serializer;
    /**
     * @constructor
     *
     * @param ident
     *   Optional: the syslog identifier. Used as a prefix on messages.
     * @param syslogOptions
     *   Optional: a bit-level OR of syslog.LOG* option constants.
     * @param syslogFacility
     *   Optional: one of the standard RFC5424 facilities.
     * @param syslog
     *   The modern-syslog service or a compatible alternative.
     * @param formatOptions
     *   Optional : The options used to format the message. The contents depends
     *   on the serializer used. Defaults to { depth: 5 }), for the legacy
     *   "util.inspect" serializer, now available as serializeInspect().
     * @param serialize
     *   Optional: a serializer function converting a document to a string.
     *
     * @see serializeDefault
     * @see modern-syslog/core.cc
     */
    constructor(ident: string | null | undefined, syslogOptions: number | null | undefined, syslogFacility: number | null | undefined, syslog: any, // modernSyslog,
    formatOptions?: {}, serialize?: null);
    /**
     * @inheritDoc
     */
    send(level: number, message: string, context: IContext): void;
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
}
export { SyslogSender, };
