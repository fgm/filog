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
    this.log(3, e.message, e);
  }

  /**
   * Arm the report subscriber.
   */
  arm() {
    this.tk.report.subscribe(this.reportSubscriber.bind(this));
  }

  /**
   * Disarm the subscriber.
   *
   * In most cases, we do not want to disarm immediately: a stack trace being
   * build may take several hundred milliseconds, and we would lose it.
   *
   * @param delay
   */
  disarm(delay = 2000) {
    setTimeout(() => {
      this.tk.report.unsubscribe(this.reportSubscriber);
    }, delay);
  }

  /** Implements the standard Meteor logger methods.
   *
   * @param level
   *   debug, info, warn, or error
   * @private
   *
   * @todo (or not ?) merge in the funky Meteor logic from the logging package.
   */
  _meteorLog(level) {
  }

  static levelName(level) {
    const levels = {
      0: 'emergency',
      1: 'alert',
      2: 'critical',
      3: 'error',
      4: 'warning',
      5: 'notice',
      6: 'informational',
      7: 'debug'
    };
    let numericLevel = Math.round(level);
    if (numericLevel < 0) {
      numericLevel = 0;
    }
    else if (numericLevel > 7) {
      numericLevel = 7;
    }
    return levels[numericLevel];
  }

  log(level, message, context) {
    console.log("Log in Logger", Logger.levelName(level), message, context);
  }

  debug() {
    this.log(7, ...arguments);
  }
  info() {
    this.log(6, ...arguments);
  }
  warn() {
    this.log(4, ...arguments);
  }
  error() {
    this.log(3, ...arguments);
  }
};

export default Logger;
