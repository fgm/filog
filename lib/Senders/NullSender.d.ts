/**
 * @fileOverview NulllSender class.
 */
/**
 * NullSender defines an explicit null sender.
 *
 * Although SenderBase is also null, this is not its defining characteristic
 * hence this alias.
 *
 * @extends SenderBase
 */
declare const NullSender: {
    new (): {
        send(_1: Levels, _2: string, _3: object): void;
    };
};
export default NullSender;
