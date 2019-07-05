/**
 * @fileOverview Base Strategy.
 */

import {ILogger} from "../Loggers/ILogger";
import * as LogLevel from "../LogLevel";
import {ISender} from "../Senders/ISender";
import { NullSender } from "../Senders/NullSender";
import {IStrategy} from "./IStrategy";

/**
 * StrategyBase is an "abstract" strategy.
 *
 * Strategies customize the active Sender instances for a given log event.
 */
class StrategyBase implements IStrategy {

  // @see https://github.com/Microsoft/TypeScript/issues/17293
  public senders: ISender[] = [];

  constructor(init = true) {
    if (init) {
      this.senders = [new NullSender()];
    }
  }

  /** @inheritDoc */
  public selectSenders(_1: LogLevel.Levels, _2: string, _3: object) {
    return this.senders;
  }

  /** @inheritDoc */
  public customizeLogger(_: ILogger): void { return; }
}

export {
  StrategyBase,
};
