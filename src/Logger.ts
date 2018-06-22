/**
 * @fileOverview Base Logger class.
 */
import TraceKit from "tracekit";
import {ILogger} from "./ILogger";
import InvalidArgumentException from "./InvalidArgumentException";
import * as LogLevel from "./LogLevel";
import {IProcessor} from "./Processors/IProcessor";
import {IStrategy} from "./Strategies/IStrategy";

// const logMethodNames = ["log", "debug", "info", "warn", "error", "_exception" ];

const SIDE = "unknown";

const DETAILS_KEY = "message_details";
const HOST_KEY = "hostname";
const TS_KEY = "timestamp";

interface ISendContext {
  [DETAILS_KEY]?: object;
  [HOST_KEY]?: string;
  [TS_KEY]?: {
    [key: string]: number,
  };
}

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
const Logger = class implements ILogger {
  public static readonly METHOD = "filog:log";

  /**
   * Map a syslog level to its standard name.
   *
   * @param {Number} level
   *   An RFC5424 level.
   *
   * @returns {String}
   *   The english name for the level.
   */
  public static levelName(level: number) {
    let numericLevel = Math.round(level);
    if (numericLevel < LogLevel.EMERGENCY || isNaN(numericLevel)) {
      numericLevel = LogLevel.EMERGENCY;
    } else if (numericLevel > LogLevel.DEBUG) {
      numericLevel = LogLevel.DEBUG;
    }
    return LogLevel.Names[numericLevel];
  }

  public processors: IProcessor[] = [];
  // FIXME Cannot use TraceKit as a type as it's a namespace.
  public tk: any;

  /**
   * @constructor
   *
   * @param {StrategyBase} strategy
   *   The sender selection strategy to apply.
   *
   */
  constructor(public strategy: IStrategy) {
    this.processors = [];
    this.side = SIDE;
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
  public arm() {
    this.tk.report.subscribe(this.reportSubscriber.bind(this));
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
   */
  public report(e): void {
    this.tk.report(e);
  }

  /**
   * Error-catching callback when the logger is arm()-ed.
   *
   * @param {Error} e
   *   The error condition to log.
   *
   * @see Logger#arm
   */
  public reportSubscriber(e): void {
    this.log(LogLevel.ERROR, e.message, e);
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
  public disarm(delay = 2000) {
    setTimeout(() => {
      this.tk.report.unsubscribe(this.reportSubscriber);
    }, delay);
  }

  /** @inheritDoc */
  public error(message: object|string, context: object = {}): void {
    this.log(LogLevel.ERROR, message, context);
  }

  /** @inheritDoc */
  public log(
    level: LogLevel.Levels,
    message: object|string,
    initialContext: object = {},
    process: boolean = true,
  ): void {
    this.validateLevel(level);
    const context1 = this.buildContext(details, this.side);

    const context2 = process
      ? this.applyProcessors(context1)
      : context1;

    this.stamp(context2, "log");

    this.send(this.strategy, level, message, context2);
  }

  /** @inheritDoc */
  public debug(message: object|string, context: object = {}): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /** @inheritDoc */
  public info(message: object|string, context: object = {}): void {
    this.log(LogLevel.INFORMATIONAL, message, context);
  }

  /**
   * Ensure a log level is in the allowed value set.
   *
   * @see Logger.log()
   *
   * @param {Number} requestedLevel
   *   A RFC5424 level.
   *
   * @returns {void}
   *
   * @throws InvalidArgumentException
   *   As per PSR-3, if level is not a valid RFC5424 level.
   */
  validateLevel(requestedLevel) {
    if (!Number.isInteger(requestedLevel) || +requestedLevel < LogLevel.EMERGENCY || +requestedLevel > LogLevel.DEBUG) {
      throw new InvalidArgumentException("The level argument to log() must be an RFC5424 level.");
    }
  }

  /** @inheritDoc */
  public warn(message: object|string, context: object = {}): void {
    this.log(LogLevel.WARNING, message, context);
  }

  /**
   * Implements the standard Meteor logger methods.
   *
   * This method is an implementation detail: do not depend on it.
   *
   * @param {String} level
   *   debug, info, warn, or error
   *
   * @todo (or not ?) merge in the funky Meteor logic from the logging package.
   */
  public _meteorLog(): void { return; }
};

Logger.KEY_DETAILS = "message_details";
Logger.KEY_HOST = "hostname";
Logger.KEY_SOURCE = "source";
Logger.KEY_TS = "timestamp";
Logger.METHOD = "filog:log";
Logger.side = SIDE;

export default Logger;
