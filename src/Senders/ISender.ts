import {IContext} from "../IContext";
import * as LogLevel from "../LogLevel";

interface ISender {
  /**
   * The single method for a sender: send data somewhere.
   *
   * @param level
   *   One of the 8 integer RFC5424 levels: 0 to 7.
   * @param message
   *   Unlike LoggerBase::log(), it is not expected to handler non-string data.
   * @param context
   *   A log event context object.
   */
  send(level: LogLevel.Levels, message: string, context: IContext): void;
}

export {
  ISender,
};
