/**
 * @fileOverview Trivial Strategy.
 */
import { ISender } from "../Senders/ISender";
/**
 * This strategy uses a single sender for all configurations.
 *
 * As such, it is mostly meant for tests.
 *
 * @extends StrategyBase
 */
declare const TrivialStrategy: {
    new (sender: ISender): {
        senders: ISender[];
        selectSenders(_1: Levels, _2: string, _3: object): ISender[];
        customizeLogger(_: import("../Loggers/ILogger").ILogger): void;
    };
};
export default TrivialStrategy;
