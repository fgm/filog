import SenderBase from './SenderBase';

/**
 * Like a UNIX tee(1), the TeeSender sends its input to multiple outputs.
 */
export default class TeeSender extends SenderBase {
  /**
   * Constructor.
   *
   * @param {Array} senders
   *   An array of senders to which to send the input.
   */
  constructor(senders) {
    super();
    this.senders = senders;
  }

  /** @inheritdoc */
  send(level, message, context) {
    const result = this.senders.map(sender => sender.send(level, message, context));
    return result;
  }
}
