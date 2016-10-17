import TraceKit from 'tracekit';

// const logMethodNames = ['log', 'debug', 'info', 'warn', 'error', '_exception' ];

const Logger = class {
  constructor() {
    this.tk = TraceKit;
  }

  /**
   * The callback invoked by TraceKit
   *
   * @param {Error} e
   */
  report(e) {
    this.tk.report(e);
  }

  reportSubscriber(e) {
    console.info("RS", e);
  }

  arm() {
    this.tk.report.subscribe(this.reportSubscriber);
  }

  disarm() {
   this.tk.report.unsubscribe(this.reportSubscriber);
  }

  /** Implements the standard Meteor logger methods.
   *
   * @param level
   *   debug, info, warn, or error
   * @private
   */
  _meteorLog(level) {
  }

  debug() {
    this._meteorLog('debug', ...arguments);
  }
  info() {
    this._meteorLog('info', ...arguments);
  }
  warn() {
    this._meteorLog('warn', ...arguments);
  }
  error() {
    this._meteorLog('error', ...arguments);
  }
};

export default Logger;
