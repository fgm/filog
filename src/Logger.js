import TraceKit from 'tracekit';
import LogLevel from './LogLevel';

// const logMethodNames = ['log', 'debug', 'info', 'warn', 'error', '_exception' ];

const Logger = class {
  /**
   * @constructor
   *
   * @param {StrategyBase} strategy
   *   The sender selection strategy to apply.
   */
  constructor(strategy) {
    this.processors = [];
    this.strategy = strategy;
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
    this.log(LogLevel.ERROR, e.message, e);
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
    let numericLevel = Math.round(level);
    if (numericLevel < LogLevel.EMERGENCY) {
      numericLevel = LogLevel.EMERGENCY;
    }
    else if (numericLevel > LogLevel.DEBUG) {
      numericLevel = LogLevel.DEBUG;
    }
    return LogLevel.Names[numericLevel];
  }

  /**
   * Reduce callback for processors.
   *
   * @see Logger.log()
   *
   * @param {Object} accu
   *   The reduction accumulator.
   * @param {ProcessorBase} current
   *   The current process to apply in the reduction.
   * @param {Boolean} cooked
   *   Optiona, default true. Apply processors to context before sending.
   *
   * @returns {Object}
   *   The result of the current reduction step.
   */
  processorReducer(accu, current) {
    const result = Object.assign(accu, current.process(accu));
    return result;
  }

  log(level, message, rawContext = {}, cooked = true) {
    const context = cooked
      ? this.processors.reduce(this.processorReducer, rawContext)
      : rawContext;

    // A timestamp is required, so insert it forcefully.
    context.timestamp = { log: Date.now() };

    const senders = this.strategy.selectSenders(level, message, context);
    senders.forEach(sender => {
      sender.send(level, message, context);
    });
  }

  debug() {
    this.log(LogLevel.DEBUG, ...arguments);
  }
  info() {
    this.log(LogLevel.INFORMATIONAL, ...arguments);
  }
  warn() {
    this.log(LogLevel.WARNING, ...arguments);
  }
  error() {
    this.log(LogLevel.ERROR, ...arguments);
  }
};

export default Logger;
