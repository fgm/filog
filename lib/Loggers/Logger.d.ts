/**
 * @fileOverview Base Logger class.
 */
import { IContext, IDetails, ITimestamps } from "../IContext";
import * as LogLevel from "../LogLevel";
import { IProcessor } from "../Processors/IProcessor";
import { IStrategy } from "../Strategies/IStrategy";
import { ILogger } from "./ILogger";
/**
 * Logger is the base class for loggers.
 */
declare class Logger implements ILogger {
    strategy: IStrategy;
    static readonly METHOD: string;
    static readonly side: string;
    /**
     * Map a syslog level to its standard name.
     *
     * @param {Number} level
     *   An RFC5424 level.
     *
     * @returns {String}
     *   The english name for the level.
     */
    static levelName(level: number): string;
    /**
     * Module-private processor reducer.
     *
     * @see Logger.process
     *
     * @internal
     * @protected
     */
    static processorReducer(accu: IContext, processor: IProcessor): IContext;
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
    static stamp(context: IContext, op: string, side: keyof ITimestamps): void;
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
    static validateLevel(requestedLevel: LogLevel.Levels): void;
    processors: IProcessor[];
    side: string;
    tk: any;
    /**
     * @constructor
     *
     * @param {StrategyBase} strategy
     *   The sender selection strategy to apply.
     *
     */
    constructor(strategy: IStrategy);
    /**
     * Arm the report subscriber.
     *
     * @returns {void}
     *
     * @see Logger#reportSubscriber
     */
    arm(): void;
    /** @inheritDoc */
    debug(message: object | string, context?: IContext): void;
    /**
     * Add defaults to the initial context.
     *
     * @param initialContext
     *   The context passed to logExtended().
     *
     * This method is only made public for the benefit of tests: it is not meant
     * to be used outside the class and its tests.
     *
     * @protected
     */
    defaultContext(initialContext: IContext): IContext;
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
    disarm(delay?: number): void;
    /** @inheritDoc */
    error(message: object | string, context?: IContext): void;
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
    getInitialContext(details?: IDetails): IContext;
    /**
     * Return the "reserved" keys of a context, made of its predefined keys.
     *
     * @param context
     *   The initial context.
     *
     * @return
     *   A context containing only these keys.
     */
    getReservedContext(context: IContext): IContext;
    /** @inheritDoc */
    info(message: object | string, context?: IContext): void;
    /** @inheritDoc */
    log(level: LogLevel.Levels, message: object | string, details: IDetails): void;
    /**
     * Process a context by applying processors, returning a non-sourced result.
     *
     * This is an internal step, only made public to enable testing. Do not use it
     * in userland code.
     *
     * @param context
     *   The context to process.
     *
     * @return
     *   The context transformed by applying processors to it, but not sourcing.
     *
     * @internal
     * @protected
     */
    process(context: IContext): IContext;
    /**
     * The callback invoked by TraceKit
     *
     * @param e
     *   Error on which to report.
     */
    report(e: Error): void;
    /**
     * Error-catching callback when the logger is arm()-ed.
     *
     * @param e
     *   The error condition to log.
     *
     * @see Logger#arm
     */
    reportSubscriber(e: Error): void;
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
    send(strategy: IStrategy, level: LogLevel.Levels, message: string, sentContext: {}): void;
    /**
     * Source a (typically processed) context.
     *
     * This is an internal step, only made public to enable testing. Do not use it
     * in userland code.
     *
     * @param context
     *   The context to source
     * @param initialTop
     *   A context made of only the reserved keys in the initial context.
     * @param initialKeys
     *   An array of all the keys in the initial context.
     *
     * @return
     *   The sourced context.
     *
     * @internal
     * @protected
     */
    source(context: IContext, initialTop: IContext, initialKeys: string[]): IContext;
    /** @inheritDoc */
    warn(message: object | string, context?: IContext): void;
    /**
     * Implements the standard Meteor logger methods.
     *
     * This method is an implementation detail: do not depend on it.
     *
     * @param _LEVEL
     *   One of the 4 Meteor log levels as a string.
     *
     * @todo (or not ?) merge in the funky Meteor logic from the logging package.
     */
    _meteorLog(_LEVEL: "debug" | "info" | "warn" | "error"): void;
    /**
     * Child classes are expected to re-implement this.
     */
    protected _getHostname(): string | undefined;
}
export { Logger, };
