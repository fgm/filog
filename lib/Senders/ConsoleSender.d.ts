/**
 * @fileOverview Console Sender class.
 *
 * Because this file is about actually using the console, it has to disable the
 * no-console rule.
 */
import { IContext } from "../IContext";
import * as LogLevel from "../LogLevel";
import { ISender } from "./ISender";
/**
 * ConsoleSender sends the log events it receives to the browser console.
 */
declare class ConsoleSender implements ISender {
    constructor();
    /** @inheritDoc */
    send(level: LogLevel.Levels, message: string, context: IContext): void;
}
export { ConsoleSender, };
