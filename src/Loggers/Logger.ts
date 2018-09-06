/**
 * @fileOverview Base Logger class.
 */

import TraceKit from "tracekit";

import {
  IContext,
  ITimestamps,
  KEY_DETAILS,
  KEY_HOST,
  KEY_SOURCE,
  KEY_TS,
} from "../IContext";
import InvalidArgumentException from "../InvalidArgumentException";
import * as LogLevel from "../LogLevel";
import {IProcessor} from "../Processors/IProcessor";
import {IStrategy} from "../Strategies/IStrategy";
import {ILogger} from "./ILogger";

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

  /**
   * Add a timestamp to a context object on the active side.
   *
   * Ensure a KEY_TS will be present, and existing timestamps are not being
   * overwritten, except possibly for any value already present at [KEY_TS][op].
   *
   * @param context
   *   Mutated. The context to stamp.
   * @param op
   *   The operation for which to add a timestamp.
   * @param side
   *   The side on which the operation is to be logged.
   *
   * @protected
   */
  public static stamp(context: IContext, op: string, side: keyof ITimestamps): void {
    const now = + new Date();
    // Ensure context actually contains a KEY_TS.
    if (typeof context[KEY_TS] === "undefined") {
      context[KEY_TS] = {} as ITimestamps;
    }

    // We know context[KEY_TS] is defined because we just ensured it was.
    const contextTs: ITimestamps = context[KEY_TS]!;

    const sideTs = contextTs[side] || {};
    sideTs[op] = now;
    contextTs[side] = sideTs;
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

  /**
   * Provide the default context bits specific to the logger instance + details.
   *
   * @param details
   *   The message details.
   *
   * This method is only made public for the benefit of tests: it is not meant
   * to be used outside the class and its tests.
   *
   * @protected
   */
  public getInitialContext(details = {}): IContext {
    const cx: IContext = {
      [KEY_DETAILS]: details,
      [KEY_SOURCE]: this.side,
    };

    const hostName = this._getHostname();
    if (typeof hostName === "string") {
      cx[KEY_HOST] = hostName;
    }

    Logger.stamp(cx, "log", this.side);
    return cx;
  }

  /** @inheritDoc */
  public info(message: object|string, context: IContext = {}): void {
    this.log(LogLevel.INFORMATIONAL, message, context);
  }

  /** @inheritDoc */
  public log(
    level: LogLevel.Levels,
    message: object|string,
    details: {} = {},
  ): void {
    this.validateLevel(level);
    const c1 = this.getInitialContext(details);
    this.send(this.strategy, level, String(message), c1);
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

  /**
   * Child classes are expected to re-implement this.
   *
   * @protected
   */
  protected _getHostname(): string | undefined {
    return undefined;
  }
}

export {
  Logger,
};
