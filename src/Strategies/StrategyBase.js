/**
 * Strategies customize the active Sender instances for a given log event.
 *
 */

import NullSender from '../Senders/NullSender';

export default class StrategyBase {
  constructor(init = true) {
    if (init) {
      this.senders = new NullSender();
    }
  }

  /**
   * Select senders to use for a given log event.
   *
   * @param {int} level
   *   The log event level..
   * @param {string} message
   *   The log event string/template.
   * @param {object} context
   *   The context of the log event.
   *
   * @returns {function[]}
   *   An array of senders to use for this event.
   */
  selectSenders(level, message, context) {
    return this.senders;
  }
}
