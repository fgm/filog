/**
 * @fileOverview Tee Sender class.
 */

import {ISender} from "./ISender";
import SenderBase from "./SenderBase";

/**
 * Like a UNIX tee(1), the TeeSender sends its input to multiple outputs.
 *
 * @extends SenderBase
 */
const TeeSender = class extends SenderBase implements ISender {
  /**
   * Constructor.
   *
   * @param {Array} senders
   *   An array of senders to which to send the input.
   */
  constructor(public senders: ISender[]) {
    super();
  }

  /** @inheritdoc */
  public send(level: number, message: string, context: object): void {
    this.senders.map((sender) => sender.send(level, message, context));
  }
};

export default TeeSender;
