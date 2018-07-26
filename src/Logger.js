/**
 * @fileOverview Base Logger class.
 */
import TraceKit from "tracekit";
import LogLevel from "./LogLevel";
import InvalidArgumentException from "./InvalidArgumentException";

// const logMethodNames = ["log", "debug", "info", "warn", "error", "_exception" ];

const SIDE = "unknown";

/**
 * Logger is the base class for loggers.
 *
 * @property {string} side
 *   Which logger is this? Expected values: "client", "server", "cordova".
 * @property {string} KEY_DETAILS
 * @property {string} KEY_HOST
 * @property {string} KEY_SOURCE
 * @property {string} KEY_TS
 * @property {string} METHOD
 */
const Logger = class {
  /**
   * @constructor
   *
   * @param {StrategyBase} strategy
   *   The sender selection strategy to apply.
   *
   */
  constructor(strategy) {
    this.processors = [];
    this.side = SIDE;
    this.strategy = strategy;
    this.tk = TraceKit;

    this.strategy.customizeLogger(this);
  }

  /**
   * Apply processors to a context, preserving reserved keys.
   *
   * @protected
   *
   * @param {Object} rawContext
   *   The context to process.
   *
   * @returns {Object}
   *   The processed context.
   */
  applyProcessors(rawContext) {
    const {
      [Logger.KEY_TS]: initialTs,
      [Logger.KEY_HOST]: initialHost,
    } = rawContext;

    const processedContext = this.processors.reduce(this.processorReducer, rawContext);

    // Timestamp is protected against modifications, for traceability.
    processedContext[Logger.KEY_TS] = { ...initialTs, ...processedContext[Logger.KEY_TS] };

    // Only add the initial [Logger.KEY_HOST] if none has been added and one existed.
    if (typeof processedContext[Logger.KEY_HOST] === "undefined" && typeof initialHost !== "undefined") {
      processedContext[Logger.KEY_HOST] = initialHost;
    }

    return processedContext;
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
   * Build a context object from log() details.
   *
   * @protected
   *
   * @see Logger.log
   *
   * @param {Object} details
   *   The message details passed to log().
   * @param {string} source
   *   The source for the event.
   * @param {Object} context
   *   Optional: a pre-existing context.
   *
   * @returns {Object}
   *   The context with details moved to the message_details subkey.
   */
  buildContext(details, source, context = {}) {
    const context1 = {
      ...context,
      [Logger.KEY_DETAILS]: details,
      [Logger.KEY_SOURCE]: source,
    };

    if (details[Logger.KEY_HOST]) {
      context1[Logger.KEY_HOST] = details[Logger.KEY_HOST];
      delete context1[Logger.KEY_DETAILS][Logger.KEY_HOST];
    }

    return context1;
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
   * Implementation compatibility to replace Meteor.error.
   *
   * @returns {void}
   *
   * @see Meteor.error
   */
  error() {
    this.log(LogLevel.ERROR, ...arguments);
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
    if (numericLevel < LogLevel.EMERGENCY || isNaN(numericLevel)) {
      numericLevel = LogLevel.EMERGENCY;
    }
    else if (numericLevel > LogLevel.DEBUG) {
      numericLevel = LogLevel.DEBUG;
    }
    return LogLevel.Names[numericLevel];
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
   * @param {Object} details
   *   (Optional). An object complementing the message.
   * @param {Boolean} process
   *   (Optional). Apply processors to context before sending. Default == true.
   *
   * @returns {void}
   *
   * @throws InvalidArgumentException
   *   As per PSR-3, if level is not a valid RFC5424 level.
   *
   * @see https://tools.ietf.org/html/rfc5424
   * @see http://www.php-fig.org/psr/psr-3/
   */
  log(level, message, details = {}, process = true) {
    this.validateLevel(level);
    const context1 = this.buildContext(details, this.side);

    const context2 = process
      ? this.applyProcessors(context1)
      : context1;

    this.stamp(context2, "log");

    this.send(this.strategy, level, message, context2);
  }

  /**
   * Reduce callback for processors.
   *
   * @private
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
   *
   */
  processorReducer(accu, current) {
    const result = current.process(accu);
    return result;
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
   * Actually send a message with a processed context using a strategy.
   *
   * @see Logger.log()
   * @protected
   *
   * @param {StrategyBase} strategy
   *   The sending strategy.
   * @param {number} level
   *   An RFC5424 level.
   * @param {string} message
   *   The message template.
   * @param {object} sentContext
   *   A message context, possibly including a message_details key to separate
   *   data passed to the log() call from data added by processors.
   *
   * @returns {void}
   */
  send(strategy, level, message, sentContext) {
    const senders = strategy.selectSenders(level, message, sentContext);
    senders.forEach(sender => {
      sender.send(level, message, sentContext);
    });
  }

  /**
   * Add a timestamp to a context object.
   *
   * @param {Object} context
   *   Mutated. The context to stamp.
   * @param {string} op
   *   The operation for which to add a timestamp.
   *
   * @returns {void}
   */
  stamp(context, op) {
    if (!context[Logger.KEY_TS]) {
      context[Logger.KEY_TS] = {};
    }
    if (!context[Logger.KEY_TS][this.side]) {
      context[Logger.KEY_TS][this.side] = {};
    }
    context[Logger.KEY_TS][this.side][op] = +new Date();
  }

  /**
   * Ensure a log level is in the allowed value set.
   *
   * @see Logger.log()
   *
   * @param {*} requestedLevel
   *   A possibly invalid severity level.
   *
   * @returns {void}
   *
   * @throws InvalidArgumentException
   */
  validateLevel(requestedLevel) {
    if (!Number.isInteger(requestedLevel) || +requestedLevel < LogLevel.EMERGENCY || +requestedLevel > LogLevel.DEBUG) {
      throw new InvalidArgumentException("The level argument to log() must be an RFC5424 level.");
    }
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
};

Logger.KEY_DETAILS = "message_details";
Logger.KEY_HOST = "hostname";
Logger.KEY_SOURCE = "source";
Logger.KEY_TS = "timestamp";
Logger.METHOD = "filog:log";
Logger.side = SIDE;

export default Logger;
