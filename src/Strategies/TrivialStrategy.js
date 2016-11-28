/**
 * @fileOverview Trivial Strategy.
 */

import StrategyBase from "./StrategyBase";

/**
 * This strategy uses a single sender for all configurations.
 *
 * As such, it is mostly meant for tests.
 *
 * @extends StrategyBase
 */
const TrivialStrategy = class extends StrategyBase {
  // noinspection JSClassNamingConvention
  /**
   * @constructor
   *
   * @param {function} sender
   *   The Sender to use for all events
   */
  constructor(sender) {
    super(false);
    this.senders = [sender];
  }
};

export default TrivialStrategy;
