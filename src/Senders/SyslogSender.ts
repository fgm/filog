/**
 * @fileOverview Syslog Sender class.
 */

import modernSyslog = require("modern-syslog");
import * as path from "path";
import * as util from "util";
import {IContext, KEY_TS} from "../IContext";
import {Logger} from "../Loggers/Logger";
import {ServerLogger} from "../Loggers/ServerLogger";
import * as LogLevel from "../LogLevel";
import {ISender} from "./ISender";

type Serializer = (doc: object) => string;

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
class SyslogSender implements ISender {
  public facility: number;
  public formatOptions: object;
  public ident: string;
  public option: number;
  public serialize: Serializer;

  // noinspection JSClassNamingConvention
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
  constructor(
    ident = null,
    syslogOptions: number = 0,
    syslogFacility: number | null = null,
    public syslog: any, // modernSyslog,
    formatOptions = null,
    serialize = null,
  ) {
    const programName = path.basename(process.argv[1]);
    const actualIdent = ident || programName;

    this.syslog = syslog || modernSyslog;

    this.facility = syslogFacility || this.syslog.facility.LOG_LOCAL0;
    this.ident = actualIdent;
    this.option = syslogOptions || (this.syslog.option.LOG_PID);
    this.formatOptions = formatOptions || { depth: 5 };
    this.serialize = serialize || this.serializeDefault.bind(this);

    this.syslog.open(this.ident, this.option, this.facility);
  }

  /**
   * @inheritDoc
   */
  public send(level: number, message: string, context: IContext): void {
    const doc: ISyslogContext = {
      facility: this.syslog.facility[this.facility],
      level: this.syslog.level[level],
      message,
    };

    if (typeof context !== "undefined") {
      doc.context = context;
    }
    // It should contain a timestamp.{side} object if it comes from any Logger.
    if (typeof doc.context === "undefined") {
      doc.context = { [KEY_TS]: { server: {}}};
    } else if (typeof doc.context[KEY_TS] === "undefined") {
      doc.context[KEY_TS] = {};
    }

    // doc.context.timestamp.server is known to exist from above.
    Logger.stamp(doc.context, "send", ServerLogger.side);
    this.syslog.log(level, this.serialize(doc));
  }

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
  public serializeDefault(doc: ISyslogContext): string {
    interface IStep1 {
      facility: number;
      level: LogLevel.Levels;
      logger_error: string;
      message?: string|object;
      raw: string;
    }

    let result;
    try {
      result = JSON.stringify(doc);
    } catch (e1) {
      const step1: IStep1 = {
        facility: doc.facility || this.syslog.facility.LOG_LOCAL0,
        level: doc.level,
        logger_error: `Cannot JSON.stringify logged data: ${e1.message}.`,
        raw: util.inspect(doc, this.formatOptions),
      };

      // Since doc is a SyslogContext, doc.message is a string, no need to test.
      step1.message = doc.message;

      try {
        result = JSON.stringify(step1);
      } catch (e2) {
        // Critical problem: remove moving parts.
        // RFC 5424: level 3 = error, facility 14 == log alert.
        // eslint-disable-next-line quotes
        result = '{ "level":3, "facility":14, "error":"Serialization fallback error" }';
      }
    }

    return result;
  }

  /**
   * Serialize a message to Node.js util.inspect format.
   *
   * @param doc
   *   A document to serialize. Any structure.
   *
   * @returns
   *   The serialized version of the doc argument under the formatOptions rules.
   */
  public serializeInspect(doc: object): string {
    return util.inspect(doc, this.formatOptions);
  }
}

export {
  SyslogSender,
};
