/**
 * @fileOverview Base Sender class.
 */
import * as LogLevel from "../LogLevel";
/**
 * SenderBase is an "abstract" class defining the sender interface.
 */
declare const SenderBase: {
    new (): {
        /** @inheritDoc */
        send(_1: LogLevel.Levels, _2: string, _3: object): void;
    };
};
export default SenderBase;
