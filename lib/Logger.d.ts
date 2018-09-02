import { IDetails, ISendContext } from "./ISendContext";
import * as LogLevel from "./LogLevel";
import { IProcessor } from "./Processors/IProcessor";
import { IStrategy } from "./Strategies/IStrategy";
/**
 * Logger is the base class for loggers.
 */
declare const Logger: {
    new (strategy: IStrategy): {
        processors: IProcessor[];
        side: string;
        tk: any;
        strategy: IStrategy;
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
        applyProcessors(rawContext: ISendContext): ISendContext;
        /**
         * Arm the report subscriber.
         *
         * @returns {void}
         *
         * @see Logger#reportSubscriber
         */
        arm(): void;
        doProcess(apply: boolean, contextToProcess: ISendContext): ISendContext;
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
        processorReducer(accu: {}, current: IProcessor): ISendContext;
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
         * Add a timestamp to a context object on the active side.
         *
         * @param context
         *   Mutated. The context to stamp.
         * @param op
         *   The operation for which to add a timestamp.
         */
        stamp(context: ISendContext, op: string): void;
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
        buildContext(details: IDetails, source: string, context?: ISendContext): ISendContext;
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
        error(message: string | object, context?: ISendContext): void;
        /** @inheritDoc */
        log(level: LogLevel.Levels, message: string | object, initialContext?: ISendContext, process?: boolean): void;
        /** @inheritDoc */
        debug(message: string | object, context?: ISendContext): void;
        /** @inheritDoc */
        info(message: string | object, context?: ISendContext): void;
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
        validateLevel(requestedLevel: LogLevel.Levels): void;
        /** @inheritDoc */
        warn(message: string | object, context?: ISendContext): void;
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
        _meteorLog(): void;
    };
    readonly METHOD: "filog:log";
    readonly side: string;
    /**
     * Map a syslog level to its standard name.
     *
     * @param {Number} level
     *   An RFC5424 level.
     *
     * @returns {String}
     *   The english name for the level.
     */
    levelName(level: number): string;
};
export default Logger;