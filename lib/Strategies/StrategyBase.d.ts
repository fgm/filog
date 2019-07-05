/**
 * @fileOverview Base Strategy.
 */
import { ILogger } from "../Loggers/ILogger";
import * as LogLevel from "../LogLevel";
import { ISender } from "../Senders/ISender";
import { IStrategy } from "./IStrategy";
/**
 * StrategyBase is an "abstract" strategy.
 *
 * Strategies customize the active Sender instances for a given log event.
 */
declare class StrategyBase implements IStrategy {
    senders: ISender[];
    constructor(init?: boolean);
    /** @inheritDoc */
    selectSenders(_1: LogLevel.Levels, _2: string, _3: object): ISender[];
    /** @inheritDoc */
    customizeLogger(_: ILogger): void;
}
export { StrategyBase, };
