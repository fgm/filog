/**
 * @fileOverview Tee Sender class.
 */
import { ISender } from "./ISender";
/**
 * Like a UNIX tee(1), the TeeSender sends its input to multiple outputs.
 *
 * @extends SenderBase
 */
declare const TeeSender: {
    new (senders: ISender[]): {
        senders: ISender[];
        /** @inheritdoc */
        send(level: number, message: string, context: object): void;
    };
};
export default TeeSender;
