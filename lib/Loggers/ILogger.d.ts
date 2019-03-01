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
     *   - If no such key is provided, the whole object will be serialized and
     *     replaced by a new object containing its serialization as the value for
     *     a "message" key.
     *   It may contain placeholders to be substituted with values from the
     *   context object, as defined in PSR-3. FiLog itself, providing no UI, does
     *   not perform any such replacement.
     * @param initialContext
     *   (Optional). An object complementing the message.
     * @param process
     *   (Optional). Apply processors to context before sending. Default == true.
     *
     * @throws InvalidArgumentException
     *   As per PSR-3, if level is not a valid RFC5424 level.
     *
     * As a reference, expectations about the arg in Meteor Log.Log(arg):
     * - may be an Object - except Date or Regex - in which case it is formatted
     *   by either Log.format() or EJSON.stringify().
     *   - if it has no message key, one is built from EJSON.stringify()
     * - may be anything else, in which case it is formatted as
     *   { message : new String(obj).toString() }
     * - which means in all cases, it is handled as an object with a message key.
     * - if it is an object, some of its keys are reserved:
     *   - time: Date - will be overwritten by a new Date() during logging.
     *   - level: 'debug'|'info'|'warn'|'error' - will be overwritten by the
     *     'level' argument in the eponymous Log functions.
     *
     * Also, in Meteor Log, logged events can be intercepted or suppressed by the
     * Log._intercept() and Log._suppress() functions. This package has no such
     * mechanism.
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
