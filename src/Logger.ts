/**
 * @fileOverview Base Logger class.
 */
import TraceKit from "tracekit";
import {
  IContext,
  ITimestampsHash,
  TS_KEY,
} from "./IContext";
import {ILogger} from "./ILogger";
import InvalidArgumentException from "./InvalidArgumentException";
import * as LogLevel from "./LogLevel";
import {IProcessor} from "./Processors/IProcessor";
import {IStrategy} from "./Strategies/IStrategy";

// const logMethodNames = ["log", "debug", "info", "warn", "error", "_exception" ];

const SIDE = "unknown";

/**
 * Logger is the base class for loggers.
 */
class Logger implements ILogger {
  public static readonly METHOD = "filog:log";
  public static readonly side: string = SIDE;

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
  public side: string = SIDE;
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
    this.tk = TraceKit;

    this.strategy.customizeLogger(this);
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
    this.log(LogLevel.ERROR, e.message, { error: e });
  }

  /**
   * Actually send a message with a processed context using a strategy.
   *
   * @see Logger.log()
   * @protected
   *
   * @param strategy
   *   The sending strategy.
   * @param level
   *   An RFC5424 level.
   * @param message
   *   The message template.
   * @param sentContext
   *   A message context, possibly including a message_details key to separate
   *   data passed to the log() call from data added by processors.
   *
   * @returns {void}
   */
  public send(strategy: IStrategy, level: LogLevel.Levels, message: string, sentContext: {}) {
    const senders = strategy.selectSenders(level, message, sentContext);
    senders.forEach((sender) => {
      sender.send(level, message, sentContext);
    });
  }

  /**
   * Add a timestamp to a context object on the active side.
   *
   * @param context
   *   Mutated. The context to stamp.
   * @param op
   *   The operation for which to add a timestamp.
   */
  public stamp(context: IContext, op: string): void {
    const now = + new Date();
    if (!context[TS_KEY]) {
      context[TS_KEY] = {};
    }
    const contextTs: ITimestampsHash = context[TS_KEY]!;
    const side = contextTs[this.side as keyof ITimestampsHash] || {};
    side[op] = now;
  }

  /** @inheritDoc */
  public debug(message: object|string, context: IContext = {}): void {
    this.log(LogLevel.DEBUG, message, context);
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
  public error(message: object|string, context: IContext = {}): void {
    // FIXME: message may not be a string.
    this.log(LogLevel.ERROR, message as string, context);
  }

  /** @inheritDoc */
  public info(message: object|string, context: IContext = {}): void {
    this.log(LogLevel.INFORMATIONAL, message, context);
  }

  /** @inheritDoc */
  public log(
    level: LogLevel.Levels,
    message: object|string,
    initialContext: IContext = {},
    process: boolean = true,
  ): void {
    this.send(this.strategy, level, String(message), initialContext);
  }

  /**
   * Ensure a log level is in the allowed value set.
   *
   * While this is useless for TS code, JS code using the compiled version of
   * the module still needs that check.
   *
   * @see Logger.log()
   *
   * @param {Number} requestedLevel
   *   A RFC5424 level.
   *
   * @throws InvalidArgumentException
   *   As per PSR-3, if level is not a valid RFC5424 level.
   */
  public validateLevel(requestedLevel: LogLevel.Levels): void {
    if (!Number.isInteger(requestedLevel as number)
      || +requestedLevel < LogLevel.EMERGENCY
      || +requestedLevel > LogLevel.DEBUG) {
      throw new InvalidArgumentException("The level argument to log() must be an RFC5424 level.");
    }
  }

  /** @inheritDoc */
  public warn(message: object|string, context: IContext = {}): void {
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
}

export default Logger;
