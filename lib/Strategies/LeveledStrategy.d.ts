/**
 * @fileOverview Level-based Strategy.
 */
import { ILogger } from "../ILogger";
import * as LogLevel from "../LogLevel";
import { ISender } from "../Senders/ISender";
/**
 * LeveledStrategy defines a single sender per level.
 *
 * @extends StrategyBase
 */
declare const LeveledStrategy: {
    new (low: ISender, medium: ISender, high: ISender, minLow?: LogLevel.Levels, maxHigh?: LogLevel.Levels): {
        low: ISender;
        medium: ISender;
        high: ISender;
        minLow: LogLevel.Levels;
        maxHigh: LogLevel.Levels;
        customizeLogger(logger: ILogger): void;
        selectSenders(level: LogLevel.Levels, _2: string, _3: object): ISender[];
        senders: ISender[];
    };
};
export default LeveledStrategy;
