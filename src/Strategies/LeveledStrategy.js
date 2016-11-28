/**
 * @fileOverview Level-based Strategy.
 */

import StrategyBase from "./StrategyBase";
import LogLevel from "../LogLevel";
import SenderBase from "../Senders/SenderBase";
import NullFn from "../NullFn";

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
  constructor(low, medium, high, minLow = LogLevel.DEBUG, maxHigh = LogLevel.WARNING) {
    // Do not initialize a default null sender.
    super(false);

    this.low = low;
    this.medium = medium;
    this.high = high;
    this.minLow = minLow;
    this.maxHigh = maxHigh;

    [low, medium, high].forEach(sender => {
      if (!(sender instanceof SenderBase)) {
        throw new Error("LeveledStrategy: senders must be instances of a Sender class.");
      }
    });
  }

  customizeLogger(logger) {
    ["low", "medium", "high"].forEach(level => {
      if (this[level].constructor.name === "NullSender") {
        logger.debug = NullFn;
      }
    });
  }

  /** @inheritdoc */
  selectSenders(level) {
    let sender;
    if (level >= this.minLow) {
      sender = this.low;
    }
    else if (level <= this.maxHigh) {
      sender = this.high;
    }
    else {
      sender = this.medium;
    }

    return [sender];
  }
};

export default LeveledStrategy;
