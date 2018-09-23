/**
 * @fileOverview Console Sender class.
 *
 * Because this file is about actually using the console, it has to disable the
 * no-console rule.
 */
import * as LogLevel from "../LogLevel";
/**
 * ConsoleSender sends the log events it receives to the browser console.
 *
 * @extends SenderBase
 */
declare const ConsoleSender: {
    new (): {
        /** @inheritDoc */
        send(level: LogLevel.Levels, message: string, context: object): void;
    };
};
export default ConsoleSender;
