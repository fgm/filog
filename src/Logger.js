/**
 * @fileOverview Base Logger class.
 */
import TraceKit from "tracekit";
import LogLevel from "./LogLevel";
import InvalidArgumentException from './InvalidArgumentException';

// const logMethodNames = ["log", "debug", "info", "warn", "error", "_exception" ];

/**
 * Logger is the base class for loggers.
 */
const Logger = class {
  // noinspection JSClassNamingConvention
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

    this.strategy.customizeLogger(this);
  }

  /**
   * The callback invoked by TraceKit
   *
   * @param {Error} e
   *   Error on which to report.
   *
   * @returns {void}
   */
  report(e) {
    this.tk.report(e);
  }

  /**
   * Error-catching callback when the logger is arm()-ed.
   *
   * @param {Error} e
   *   The error condition to log.
   *
   * @returns {void}
   *
   * @see Logger#arm
   */
  reportSubscriber(e) {
    this.log(LogLevel.ERROR, e.message, e);
  }

  /**
   * Arm the report subscriber.
   *
   * @returns {void}
   *
   * @see Logger#reportSubscriber
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
   * @param {Number} delay
   *   The delay before actually disarming, in milliseconds.
   *
   * @returns {void}
   */
  disarm(delay = 2000) {
    setTimeout(() => {
      this.tk.report.unsubscribe(this.reportSubscriber);
    }, delay);
  }

  /**
   * Implements the standard Meteor logger methods.
   *
   * This method is an implementation detail: do not depend on it.
   *
   * @param {String} level
   *   debug, info, warn, or error
   *
   * @returns {void}
   *
   * @todo (or not ?) merge in the funky Meteor logic from the logging package.
   */
  _meteorLog() {}

  /**
   * Map a syslog level to its standard name.
   *
   * @param {Number} level
   *   An RFC5424 level.
   *
   * @returns {String}
   *   The english name for the level.
   */
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
   *
   * @returns {Object}
   *   The result of the current reduction step.
   */
  processorReducer(accu, current) {
    const result = Object.assign(accu, current.process(accu));
    return result;
  }

  /**
   * Log an event. This is the *MAIN* method in the whole package.
   *
   * @param {Number} level
   *   An RFC5424 severity level.
   * @param {Object|String} message
   *   - If it is a string, the message body
   *   - Otherwise it must be an object with a "message" key.
   *   It may contain placeholders to be substituted with values from the
   *   context object, as in PSR-3.
   * @param {Object} rawContext
   *   (Optional). An object complementing the message.
   * @param {Boolean} cooked
   *   (Optional). Is the context already reduced ?
   *
   * @returns {void}
   *
   * @throws InvalidArgumentException
   *   As per PSR-3, if level is not a valid RFC5424 level.
   *
   * @see https://tools.ietf.org/html/rfc5424
   * @see http://www.php-fig.org/psr/psr-3/
   */
  log(level, message, rawContext = {}, cooked = true) {
    if (!Number.isInteger(level) || +level < LogLevel.EMERGENCY || +level > LogLevel.DEBUG) {
      throw new InvalidArgumentException("The level argument to log() must be an RFC5424 level.");
    }

    const context = cooked
      ? this.processors.reduce(this.processorReducer, { message_details: rawContext })
      : rawContext;

    // A timestamp is required, so insert it forcefully.
    context.timestamp = { log: Date.now() };

    const senders = this.strategy.selectSenders(level, message, context);
    senders.forEach(sender => {
      sender.send(level, message, context);
    });
  }

  /**
   * Implementation compatibility to replace Meteor.debug.
   *
   * @returns {void}
   *
   * @see Meteor.debug
   */
  debug() {
    this.log(LogLevel.DEBUG, ...arguments);
  }

  /**
   * Implementation compatibility to replace Meteor.info.
   *
   * @returns {void}
   *
   * @see Meteor.info
   */
  info() {
    this.log(LogLevel.INFORMATIONAL, ...arguments);
  }

  /**
   * Implementation compatibility to replace Meteor.warn.
   *
   * @returns {void}
   *
   * @see Meteor.warn
   */
  warn() {
    this.log(LogLevel.WARNING, ...arguments);
  }

  /**
   * Implementation compatibility to replace Meteor.error.
   *
   * @returns {void}
   *
   * @see Meteor.error
   */
  error() {
    this.log(LogLevel.ERROR, ...arguments);
  }
};

export default Logger;
