/**
 * @fileOverview Level-based Strategy.
 */

import {ILogger} from "../ILogger";
import * as LogLevel from "../LogLevel";
import NullFn from "../NullFn";
import {ISender} from "../Senders/ISender";
import NullSender from "../Senders/NullSender";
import SenderBase from "../Senders/SenderBase";
import StrategyBase from "./StrategyBase";

/**
 * LeveledStrategy defines a single sender per level.
 *
 * @extends StrategyBase
 */
const LeveledStrategy = class extends StrategyBase {

  // noinspection JSClassNamingConvention
  /**
   * @constructor
   *
   * @param {function} low
   *   The Sender to use for low-interest events.
   * @param {function} medium
   *   The Sender to use for medium-interest events.
   * @param {function} high
   *   The Sender to use for high-interest events.
   * @param {int} minLow
   *   The minimum level to handle as a low-interest event.
   * @param {int} maxHigh
   *   The maximum level to handle as a high-interest event.
   */
  constructor(
    public low: ISender,
    public medium: ISender,
    public high: ISender,
    public minLow: LogLevel.Levels = LogLevel.DEBUG,
    public maxHigh: LogLevel.Levels = LogLevel.WARNING) {
    // Do not initialize a default null sender.
    super(false);
    this.senders = [low, medium, high];

    this.senders.forEach((sender) => {
      if (!(sender instanceof SenderBase)) {
        throw new Error("LeveledStrategy: senders must be instances of a Sender class.");
      }
    });
  }

  public customizeLogger(logger: ILogger): void {
    ["low", "medium", "high"].forEach((level) => {
      if (this[level as keyof this] instanceof NullSender) {
        logger.debug = NullFn;
      }
    });
  }

  public selectSenders(level: LogLevel.Levels, _2: string, _3: object) {
    let sender;
    if (level >= this.minLow) {
      sender = this.low;
    } else if (level <= this.maxHigh) {
      sender = this.high;
    } else {
      sender = this.medium;
    }

    return [sender];
  }
};

export default LeveledStrategy;
