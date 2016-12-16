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
   *   Optional : The options used to format the message (default to { depth: 5 }).
   */
  constructor(processors = [], ident = null, syslogOptions = null, syslogFacility = null, syslog = null, formatOptions = null) {
    console.log("syslog sender", processors);
    super(processors);
    const programName = path.basename(process.argv[1]);
    const actualIdent = ident || programName;

    this.syslog = syslog || modernSyslog;

    this.facility = syslogFacility || this.syslog.facility.LOG_LOCAL0;
    this.ident = actualIdent;
    this.option = syslogOptions || (this.syslog.option.LOG_PID);
    this.formatOptions = formatOptions || { depth: 5 };

    this.syslog.open(this.ident, this.option, this.facility);
  }

  /**
   * @inheritDoc
   */
  send(level, message, context) {
    let doc = {
      message,
      level: this.syslog.level[level],
      facility: this.syslog.facility[this.facility]
    };

    const processedContext = super.send(level, message, context);
    // It should already contain a timestamp object anyway.
    if (typeof processedContext !== "undefined") {
      doc.context = processedContext;
    }
    this.syslog.log(level, util.inspect(doc, this.formatOptions));
    return processedContext;
  }
};

export default SyslogSender;
