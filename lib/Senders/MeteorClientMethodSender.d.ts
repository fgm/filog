/** global: Meteor */
import { ISender } from "./ISender";
/**
 * MeteorClientMethodSender send data from the client to the server over DDP.
 */
declare class MeteorClientMethodSender implements ISender {
    constructor();
    /** @inheritDoc */
    send(level: number, message: string, context: object): void;
}
export { MeteorClientMethodSender, };
