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
   */
  constructor(public strategy: IStrategy) {
    this.processors = [];
    this.tk = TraceKit;

    this.strategy.customizeLogger(this);
  }

  /**
   * The callback invoked by TraceKit
   *
   * @param e
   *   Error on which to report.
   */
  public report(e: Error): void {
    this.tk.report(e);
  }

  /**
   * Error-catching callback when the logger is arm()-ed.
   *
   * @param e
   *   The error condition to log.
   *
   * @see Logger#arm
   */
  public reportSubscriber(e: Error): void {
    this.log(LogLevel.ERROR, e.message, e);
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
  public _meteorLog() { return; }

  /** @inheritDoc */
  public log(
    level: LogLevel.Levels,
    message: object|string,
    initialContext: object = {},
    process: boolean = true,
  ): void {
    /**
     * Reduce callback for processors.
     *
     * @see Logger.log()
     *
     * @param accu
     *   The reduction accumulator.
     * @param current
     *   The current process to apply in the reduction.
     *
     * @returns
     *   The result of the current reduction step.
     */
    const processorReducer = (accu: object, current: IProcessor): object => {
      const result = current.process(accu);
      return result;
    };

    const applyProcessors = (rawContext: ISendContext): {} => {
      // Context may contain message_details and timestamps from upstream. Merge them.

      const {
        [DETAILS_KEY]: initialDetails,
        [TS_KEY]: initialTs,
        [HOST_KEY]: initialHost,
        // TS forbids trailing commas on rest parms, TSLint requires them...
        // tslint:disable-next-line
        ...contextWithoutDetails
      } = rawContext;

      const processedContext: ISendContext = this.processors.reduce(processorReducer, {
        [DETAILS_KEY]: contextWithoutDetails,
      });

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

    const finalContext: ISendContext = process ? applyProcessors(initialContext) : initialContext;

    // A timestamp is required, so insert it forcefully.
    finalContext.timestamp = { log: Date.now() };

    const senders = this.strategy.selectSenders(level, String(message), finalContext);
    senders.forEach((sender) => {
      sender.send(level, String(message), finalContext);
    });
  }

  /** @inheritDoc */
  public debug(message: object|string, context: object = {}): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /** @inheritDoc */
  public info(message: object|string, context: object = {}): void {
    this.log(LogLevel.INFORMATIONAL, message, context);
  }

  /** @inheritDoc */
  public warn(message: object|string, context: object = {}): void {
    this.log(LogLevel.WARNING, message, context);
  }

  /** @inheritDoc */
  public error(message: object|string, context: object = {}): void {
    this.log(LogLevel.ERROR, message, context);
  }
};

export default Logger;
