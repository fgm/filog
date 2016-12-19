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
    super(processors);
    this.senders = senders;
  }

  /** @inheritdoc */
  send(level, message, context) {
    const processedContext = super.send(level, message, context);
    this.senders.map(sender => sender.send(level, message, processedContext));
    return processedContext;
  }

  /**
   * {@inheritDoc}
   *
   * The tee sender needs to propagate the keys it receives to its children.
   *
   * @param {string[]} processorKeys
   *   An array of keys.
   *
   * @returns {void}
   */
  setProcessorKeys(processorKeys) {
    this.processorKeys = processorKeys;
    this.senders.forEach((sender) => {
      sender.setProcessorKeys([...new Set([...sender.getProcessorKeys(), ...processorKeys])]);
    });
  }
};

export default TeeSender;
