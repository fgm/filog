import * as LogLevel from "./LogLevel";
import { IProcessor } from "./Processors/IProcessor";
import { IStrategy } from "./Strategies/IStrategy";
/**
 * Logger is the base class for loggers.
 */
declare const Logger: {
    new (strategy: IStrategy): {
        processors: IProcessor[];
        tk: any;
        strategy: IStrategy;
        applyProcessors(rawContext: any): any;
        doProcess(apply: any, contextToProcess: any): any;
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
        processorReducer(accu: any, current: any): any;
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
        send(strategy: any, level: any, message: any, sentContext: any): void;
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
        validateLevel(requestedLevel: any): void;
        /**
         * Arm the report subscriber.
         *
         * @returns {void}
         *
         * @see Logger#reportSubscriber
         */
        arm(): void;
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
        _meteorLog(): void;
        /** @inheritDoc */
        log(level: LogLevel.Levels, message: string | object, initialContext?: object, process?: boolean): void;
        /** @inheritDoc */
        debug(message: string | object, context?: object): void;
        /** @inheritDoc */
        info(message: string | object, context?: object): void;
        /** @inheritDoc */
        warn(message: string | object, context?: object): void;
        /** @inheritDoc */
        error(message: string | object, context?: object): void;
    };
    readonly METHOD: "filog:log";
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
