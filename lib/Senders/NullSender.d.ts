/**
 * @fileOverview NulllSender class.
 */
import { ISender } from "./ISender";
import { IContext } from "../IContext";
import * as LogLevel from "../LogLevel";
/**
 * NullSender defines an explicit null sender.
 */
declare class NullSender implements ISender {
    /** @inheritDoc */
    send(_1: LogLevel.Levels, _2: string, _3: IContext): void;
}
export { NullSender, };
