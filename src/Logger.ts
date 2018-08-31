/**
 * @fileOverview Base Logger class.
 */
import TraceKit from "tracekit";
import {ILogger} from "./ILogger";
import InvalidArgumentException from "./InvalidArgumentException";
import {
  DETAILS_KEY,
  HOST_KEY,
  IDetails,
  ISendContext,
  ITsHash,
  SOURCE_KEY,
  TS_KEY,
} from "./ISendContext";
import * as LogLevel from "./LogLevel";
import {IProcessor} from "./Processors/IProcessor";
import {IStrategy} from "./Strategies/IStrategy";

// const logMethodNames = ["log", "debug", "info", "warn", "error", "_exception" ];

const SIDE = "unknown";

/**
 * Logger is the base class for loggers.
 */
const Logger = class implements ILogger {
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
   * Apply processors to a context, preserving reserved keys.
   *
   * @protected
   *
   * @param rawContext
   *   The context to process.
   *
   * @returns
   *   The processed context.
   */
  public applyProcessors(rawContext: ISendContext): ISendContext {
    const {
      [TS_KEY]: initialTs,
      [HOST_KEY]: initialHost,
    } = rawContext;

    const processedContext: ISendContext = this.processors.reduce(this.processorReducer, rawContext);

    // Timestamp is protected against modifications, for traceability.
    processedContext[TS_KEY] = { ...initialTs, ...processedContext[TS_KEY] };

    // Only add the initial [HOST_KEY] if none has been added and one existed.
    if ((typeof processedContext[HOST_KEY] === "undefined") && typeof initialHost === "string") {
      // The "as" is not needed for the compiler but for TSLint.
      processedContext[HOST_KEY] = initialHost as string;
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

  public doProcess(apply: boolean, contextToProcess: ISendContext): ISendContext {
    const finalContext = apply ? this.applyProcessors(contextToProcess) : contextToProcess;

    // A timestamp is required, so insert it forcefully.
    finalContext.timestamp = { [this.side]: { log: +Date.now() } };
    return finalContext;
  }

  /**
   * Reduce callback for processors.
   *
   * @private
   * @see Logger.log()
   *
   * @param accu
   *   The reduction accumulator.
   * @param current
   *   The current process to apply in the reduction.
   *
   * @returns
   *   The result of the current reduction step.
   *
   */
  public processorReducer(accu: {}, current: IProcessor): ISendContext {
    const result = current.process(accu);
    return result;
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
  public stamp(context: ISendContext, op: string): void {
    const now = + new Date();
    if (!context[TS_KEY]) {
      context[TS_KEY] = {};
    }
    const contextTs: ITsHash = context[TS_KEY]!;
    const side = contextTs[this.side as keyof ITsHash] || {};
    side[op] = now;
  }

  /**
   * Build a context object from log() details.
   *
   * @protected
   *
   * @see Logger.log
   *
   * @param details
   *   The message details passed to log().
   * @param source
   *   The source for the event.
   * @param context
   *   Optional: a pre-existing context.
   *
   * @returns
   *   The context with details moved to the message_details subkey.
   */
  public buildContext(details: IDetails, source: string, context: ISendContext = {}): ISendContext {
    const context1 = {
      ...context,
      [DETAILS_KEY]: details,
      [SOURCE_KEY]: source,
    };

    if (details[HOST_KEY]) {
      context1[HOST_KEY] = details[HOST_KEY];
      delete context1[DETAILS_KEY][HOST_KEY];
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
  public error(message: object|string, context: ISendContext = {}): void {
    // FIXME: message may not be a string.
    this.log(LogLevel.ERROR, message as string, context);
  }

  /** @inheritDoc */
  public log(
    level: LogLevel.Levels,
    message: object|string,
    initialContext: ISendContext = {},
    process: boolean = true,
  ): void {
    this.validateLevel(level);
    const context1 = this.buildContext(initialContext, this.side);

    const context2 = process
      ? this.applyProcessors(context1)
      : context1;

    this.stamp(context2, "log");

    // @FIXME this cast is not really correct to handle non-string messages.
    this.send(this.strategy, level, message as string, context2);
  }

  /** @inheritDoc */
  public debug(message: object|string, context: ISendContext = {}): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /** @inheritDoc */
  public info(message: object|string, context: ISendContext = {}): void {
    this.log(LogLevel.INFORMATIONAL, message, context);
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
  public warn(message: object|string, context: ISendContext = {}): void {
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

export default Logger;
