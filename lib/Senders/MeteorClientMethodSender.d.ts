/** global: Meteor */
/**
 * MeteorClientMethodSender send data from the client to the server over DDP.
 *
 * @extends SenderBase
 */
declare const MeteorClientMethodSender: {
    new (): {
        /** @inheritDoc */
        send(level: number, message: string, context: object): void;
    };
};
export default MeteorClientMethodSender;
