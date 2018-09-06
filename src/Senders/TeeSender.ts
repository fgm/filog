/**
 * @fileOverview Tee Sender class.
 */

import {IContext} from "../IContext";
import * as LogLevel from "../LogLevel";
import {ISender} from "./ISender";

/**
 * Like a UNIX tee(1), the TeeSender sends its input to multiple outputs.
 */
class TeeSender implements ISender {
  /**
   * Constructor.
   *
   * @param {Array} senders
   *   An array of senders to which to send the input.
   */
  constructor(public senders: ISender[]) {}

  /** @inheritdoc */
  public send(level: LogLevel.Levels, message: string, context: IContext): void {
    this.senders.map((sender) => sender.send(level, message, context));
  }
}

export {
  TeeSender,
};
