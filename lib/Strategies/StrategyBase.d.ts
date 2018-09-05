/**
 * @fileOverview Base Strategy.
 */
import { ILogger } from "../Loggers/ILogger";
import * as LogLevel from "../LogLevel";
import { ISender } from "../Senders/ISender";
/**
 * StrategyBase is an "abstract" strategy.
 *
 * Strategies customize the active Sender instances for a given log event.
 *
 * @see SenderBase
 */
declare const StrategyBase: {
    new (init?: boolean): {
        senders: ISender[];
        selectSenders(_1: LogLevel.Levels, _2: string, _3: object): ISender[];
        customizeLogger(_: ILogger): void;
    };
};
export default StrategyBase;
