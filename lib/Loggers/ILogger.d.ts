import { IContext, IDetails } from "../IContext";
import * as LogLevel from "../LogLevel";
import { IProcessor } from "../Processors/IProcessor";
interface ILogger {
    processors: IProcessor[];
    side: string;
    /**
     * Log an event. This is the *MAIN* method in the whole package.
     *
     * @param level
     *   An RFC5424 severity level.
     * @param message
     *   - If it is a string, the message body
     *   - Otherwise it must be an object with a "message" key.
     *   It may contain placeholders to be substituted with values from the
     *   context object, as in PSR-3.
     * @param initialContext
     *   (Optional). An object complementing the message.
     * @param process
     *   (Optional). Apply processors to context before sending. Default == true.
     *
     * @throws InvalidArgumentException
     *   As per PSR-3, if level is not a valid RFC5424 level.
     *
     * @see https://tools.ietf.org/html/rfc5424
     * @see http://www.php-fig.org/psr/psr-3/
     */
    log(level: LogLevel.Levels, message: string, context: IDetails): void;
    /**
     * Implementation compatibility to replace Meteor.debug.
     *
     * @returns {void}
     *
     * @see Meteor.debug
     */
    debug(message: string, context: IContext): void;
    /**
     * Implementation compatibility to replace Meteor.info.
     *
     * @see Meteor.info
     */
    info(message: string, context: IContext): void;
    /**
     * Implementation compatibility to replace Meteor.warn.
     *
     * @see Meteor.warn
     */
    warn(message: string, context: IContext): void;
    /**
     * Implementation compatibility to replace Meteor.error.
     *
     * @see Meteor.error
     */
    error(message: string, context: IContext): void;
}
export { ILogger, };