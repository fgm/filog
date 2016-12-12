/**
 * @fileOverview Syslog Sender class.
 */
import * as path from "path";
import * as modernSyslog from "modern-syslog";
import * as util from "util";
import SenderBase from "./SenderBase";

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
const SyslogSender = class extends SenderBase {
  // noinspection JSClassNamingConvention
  /**
   * @constructor
   *
   * @param {ProcessorBase[]} processors
   *   Processors to be applied by this sender instead of globally.
   * @param {String} ident
   *   Optional: the syslog identifier. Used as a prefix on messages.
   * @param {Object} syslogOptions
   *   Optional: a bit-level OR of syslog.LOG* option constants.
   * @param {Number} syslogFacility
   *   Optional: one of the standard RFC5424 facilities.
   * @param {Syslog} syslog
   *   The modern-syslog service or a compatible alternative.
   * @param {Object} formatOptions
   *   Optional : The options used to format the message. The contents depends
   *   on the serializer used. Defaults to { depth: 5 }), for the legacy
   *   "util.inspect" serializer, now available as serializeInspect().
   * @param {Function} serialize
   *   Optional: a serializer function converting a document to a string.
   *
   * @see serializeDefault
   * @see modern-syslog/core.cc
   */
  constructor(processors = [], ident = null, syslogOptions = null, syslogFacility = null, syslog = null, formatOptions = null) {
    super();
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
  send(level, message, context) {
    let doc = {
      message,
      level: this.syslog.level[level],
      facility: this.syslog.facility[this.facility],
    };

    const processedContext = super.send(level, message, context);
    // It should already contain a timestamp object anyway.
    if (typeof processedContext !== "undefined") {
      doc.context = processedContext;
    }

    this.syslog.log(level, this.serialize(doc));
    return processedContext;
  }

  /**
   * Serialize a message to JSON. Handles circular documents with a fallback.
   *
   * @param {Object} doc
   * - an object with 3 mandatory keys and an optional one:
   *   - message: a string or object, as per Meteor Log package
   *   - level: a numeric severity level, like modernSyslog.level.LOG_DEBUG
   *   - facility: a syslog facility, like modernSyslog.facility.LOG_LOCAL0
   *   - (Optional) context: an object of context values. Anything goes.
   *
   * @returns {string}
   *   The serialized version of the doc argument under the formatOptions rules.
   */
  serializeDefault(doc) {
    let result;
    try {
      result = JSON.stringify(doc);
    }
    catch (e1) {
      const step1 = {
        level: doc.level,
        facility: doc.facility,
        "logger_error": `Cannot JSON.stringify logged data: ${e1.message}.`,
        raw: util.inspect(doc, this.formatOptions),
      };

      if (typeof doc.message === "string") {
        step1.message = doc.message;
      }

      try {
        result = JSON.stringify(step1);
      }
      catch (e2) {
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
   * @param {Object} doc
   *   A document to serialize. Any structure.
   *
   * @returns {string}
   *   The serialized version of the doc argument under the formatOptions rules.
   */
  serializeInspect(doc) {
    return util.inspect(doc, this.formatOptions);
  }
};

export default SyslogSender;
