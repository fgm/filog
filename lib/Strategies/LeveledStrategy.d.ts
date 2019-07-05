/**
 * @fileOverview Level-based Strategy.
 */
import { IContext } from "../IContext";
import { ILogger } from "../Loggers/ILogger";
import * as LogLevel from "../LogLevel";
import { ISender } from "../Senders/ISender";
import { IStrategy } from "./IStrategy";
import { StrategyBase } from "./StrategyBase";
/**
 * LeveledStrategy defines a single sender per level.
 *
 * @extends StrategyBase
 */
declare class LeveledStrategy extends StrategyBase implements IStrategy {
    low: ISender;
    medium: ISender;
    high: ISender;
    minLow: LogLevel.Levels;
    maxHigh: LogLevel.Levels;
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
    constructor(low: ISender, medium: ISender, high: ISender, minLow?: LogLevel.Levels, maxHigh?: LogLevel.Levels);
    /** @inheritDoc */
    customizeLogger(logger: ILogger): void;
    selectSenders(level: LogLevel.Levels, _2: string, _3: IContext): ISender[];
}
export { LeveledStrategy, };
