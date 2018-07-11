/**
 * @fileOverview Base Logger class.
 */
import TraceKit from "tracekit";
import LogLevel from "./LogLevel";
import InvalidArgumentException from "./InvalidArgumentException";

// const logMethodNames = ["log", "debug", "info", "warn", "error", "_exception" ];

/**
 * Logger is the base class for loggers.
 */
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

    this.strategy.customizeLogger(this);
  }

  applyProcessors(rawContext) {
    // Context may contain message_details and timestamps from upstream. Merge them.
    const DETAILS_KEY = "message_details";
    const TS_KEY = "timestamp";
    const HOST_KEY = "hostname";

    let context1 = rawContext;
    if (!rawContext[DETAILS_KEY]) {
      context1 = { [DETAILS_KEY]: rawContext };
    }
    const {
      [DETAILS_KEY]: initialDetails,
      [TS_KEY]: initialTs,
      [HOST_KEY]: initialHost,
      ...contextWithoutDetails
    } = rawContext;

    const processedContext = this.processors.reduce(this.processorReducer, context1);

    const processedDetails = { ...initialDetails, ...processedContext[DETAILS_KEY] };
    if (Object.keys(processedDetails).length > 0) {
      processedContext[DETAILS_KEY] = processedDetails;
    }
    processedContext[TS_KEY] = { ...initialTs, ...processedContext[TS_KEY] };

    // Only add the initial [HOST_KEY] if none has been added and one existed.
    if (typeof processedContext[HOST_KEY] === "undefined" && typeof initialHost !== "undefined") {
      processedContext[HOST_KEY] = initialHost;
    }

    // // Set aside reserved keys to allow restoring them after processing.
    // const {
    //   [DETAILS_KEY]: initialDetails,
    //   [TS_KEY]: initialTs,
    //   [HOST_KEY]: initialHost,
    //   ...contextWithoutDetails
    // } = rawContext;
    //
    // const processedContext = this.processors.reduce(processorReducer, { [DETAILS_KEY]: contextWithoutDetails });
    //
    // // New context details keys, if any, with the same name override existing ones.
    // const details = { ...initialDetails, ...processedContext[DETAILS_KEY] };
    // if (Object.keys(details).length > 0) {
    //   processedContext[DETAILS_KEY] = details;
    // }
    // processedContext[TS_KEY] = { ...initialTs, ...processedContext[TS_KEY] };
    //
    // // Only add the initial [HOST_KEY] if none has been added and one existed.
    // if (typeof processedContext[HOST_KEY] === "undefined" && typeof initialHost !== "undefined") {
    //   processedContext[HOST_KEY] = initialHost;
    // }

    return processedContext;
  }

  doProcess(apply, contextToProcess) {
    const finalContext = apply ? this.applyProcessors(contextToProcess) : contextToProcess;

    // A timestamp is required, so insert it forcefully.
    finalContext.timestamp = { log: Date.now() };
    return finalContext;
  }

  /**
   * Reduce callback for processors.
   *
   * @private
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
   * @private
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
   * Ensure a log level is in the allowed value set.
   *
   * @see Logger.log()
   *
   * @param {*} requestedLevel
   *   A possibly invalid severity level.
   *
   * @returns {void}
   */
  validateLevel(requestedLevel) {
    if (!Number.isInteger(requestedLevel) || +requestedLevel < LogLevel.EMERGENCY || +requestedLevel > LogLevel.DEBUG) {
      throw new InvalidArgumentException("The level argument to log() must be an RFC5424 level.");
    }
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
    const finalContext = this.doProcess(process, details);
    this.send(this.strategy, level, message, finalContext);
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

Logger.METHOD = "filog:log";

export default Logger;
