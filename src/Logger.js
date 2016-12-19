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
   * The forced 'timestamp' processorKey is needed because it is forcefully
   * inserted during Logger.log().
   *
   * @see Logger#log
   *
   * @param {StrategyBase} strategy
   *   The sender selection strategy to apply.
   * @param {ProcessorBase[]} processors
   *   An array of processor instances.
   *
   * @property {StrategyBase} strategy
   */
  constructor(strategy, processors = []) {
    this.processors = processors;
    this.processorKeys = processors.reduce((accu, processor) => {
      return [...accu, ...processor.getTrustedKeys()];
    }, ['timestamp']);
    this.strategy = strategy;
    this.tk = TraceKit;

    this.strategy.customizeLogger(this);
    this.strategy.customizeSenders(this.processorKeys);
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
   * @param {Object} initialContext
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
  log(level, message, initialContext = {}, process = true) {
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
    const processorReducer = (accu, current) => {
      const result = current.process(accu);
      return result;
    };

    const applyProcessors = (rawContext) => {
      // Context may contain message_details and timestamps from upstream. Merge them.
      const DETAILS_KEY = "message_details";
      const TS_KEY = "timestamp";
      const HOST_KEY = "hostname";

      const {
        [DETAILS_KEY]: initialDetails,
        [TS_KEY]: initialTs,
        [HOST_KEY]: initialHost,
        ...contextWithoutDetails
      } = rawContext;

      const processedContext = this.processors.reduce(processorReducer, { [DETAILS_KEY]: contextWithoutDetails });

      // New context details keys, if any, with the same name override existing ones.
      const details = { ...initialDetails, ...processedContext[DETAILS_KEY] };
      if (Object.keys(details).length > 0) {
        processedContext[DETAILS_KEY] = details;
      }
      processedContext[TS_KEY] = { ...initialTs, ...processedContext[TS_KEY] };

      // Only add the initial [HOST_KEY] if none has been added and one existed.
      if (typeof processedContext[HOST_KEY] === "undefined" && typeof initialHost !== "undefined") {
        processedContext[HOST_KEY] = initialHost;
      }

      return processedContext;
    };

    if (!Number.isInteger(level) || +level < LogLevel.EMERGENCY || +level > LogLevel.DEBUG) {
      throw new InvalidArgumentException("The level argument to log() must be an RFC5424 level.");
    }

    const finalContext = process ? applyProcessors(initialContext) : initialContext;

    // A timestamp is required, so insert it forcefully.
    finalContext.timestamp = { log: Date.now() };

    const senders = this.strategy.selectSenders(level, message, finalContext);
    senders.forEach(sender => {
      sender.send(level, message, finalContext, this.formatOptions);
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

Logger.METHOD = "filog:log";

export default Logger;
