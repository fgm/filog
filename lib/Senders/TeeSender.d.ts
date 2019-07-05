/**
 * @fileOverview Tee Sender class.
 */
import { IContext } from "../IContext";
import * as LogLevel from "../LogLevel";
import { ISender } from "./ISender";
/**
 * Like a UNIX tee(1), the TeeSender sends its input to multiple outputs.
 */
declare class TeeSender implements ISender {
    senders: ISender[];
    /**
     * Constructor.
     *
     * @param {Array} senders
     *   An array of senders to which to send the input.
     */
    constructor(senders: ISender[]);
    /** @inheritdoc */
    send(level: LogLevel.Levels, message: string, context: IContext): void;
}
export { TeeSender, };
