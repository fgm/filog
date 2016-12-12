/**
 * @fileOverview Tee Sender class.
 */

import SenderBase from "./SenderBase";

/**
 * Like a UNIX tee(1), the TeeSender sends its input to multiple outputs.
 *
 * @extends SenderBase
 */
const TeeSender = class extends SenderBase {
  /**
   * Constructor.
   *
   * @param {ProcessorBase[]} processors
   *   Processors to be applied by this sender instead of globally.
   * @param {Array} senders
   *   An array of senders to which to send the input.
   */
  constructor(processors = [], senders) {
    console.log("Tee sender", processors);
    super(processors);
    this.senders = senders;
  }

  /** @inheritdoc */
  send(level, message, context) {
    const processedContext = super.send(level, message, context);
    this.senders.map(sender => sender.send(level, message, processedContext));
    return processedContext;
  }
};

export default TeeSender;
