/**
 * @fileOverview Trivial Strategy.
 */

import {ISender} from "../Senders/ISender";
import {IStrategy} from "./IStrategy";
import { StrategyBase } from "./StrategyBase";

/**
 * This strategy uses a single sender for all configurations.
 *
 * As such, it is mostly meant for tests.
 *
 * @extends StrategyBase
 */
class TrivialStrategy extends StrategyBase implements IStrategy {
  // noinspection JSClassNamingConvention
  /**
   * @constructor
   *
   * @param {function} sender
   *   The Sender to use for all events
   */
  constructor(sender: ISender) {
    super(false);
    this.senders = [sender];
  }
}

export {
  TrivialStrategy,
};
