/**
 * @fileOverview Base Sender class.
 */
import * as LogLevel from "../LogLevel";
import { ISender } from "./ISender";
/**
 * SenderBase is an "abstract" class defining the sender interface.
 */
declare class SenderBase implements ISender {
    /** @inheritDoc */
    send(_1: LogLevel.Levels, _2: string, _3: object): void;
}
export { SenderBase, };
