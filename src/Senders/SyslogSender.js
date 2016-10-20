import * as path from 'path';
import * as modernSyslog from 'modern-syslog';
import * as util from 'util';
import SenderBase from './SenderBase';

export default class SyslogSender extends SenderBase {
  /**
   * @constructor
   *
   * @param {String} ident
   *   Optional: the syslog identifier. Used as a prefix on messages.
   * @param {Object} option
   *   Optional: a bit-level OR of syslog.LOG* option constants.
   * @param {Number} facility
   *   Optional: one of the standard RFC5424 facilities.
   * @param {Syslog} syslog
   *   The modern-syslog service or a compatible alternative.
   */
  constructor(ident = null, option = null, facility = null, syslog = null) {
    super();
    const programName = path.basename(process.argv[1]);
    const actualIdent = ident || programName;

    this.syslog = syslog || modernSyslog;

    this.facility = facility || this.syslog.facility.LOG_LOCAL0;
    this.ident = actualIdent;
    this.option = option || (this.syslog.option.LOG_PID);

    this.syslog.open(this.ident, this.option, this.facility);
  }

  /**
   * @inheritDoc
   */
  send(level, message, context) {
    let doc = { message };
    // It should already contain a timestamp object anyway.
    if (typeof context !== 'undefined') {
      doc.context = context;
    }
    this.syslog.log(level, util.inspect(doc));
  }
}
