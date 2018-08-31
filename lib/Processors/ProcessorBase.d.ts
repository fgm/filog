/**
 * @fileOverview Base Processor class.
 */
import { ISendContext } from "../ISendContext";
/**
 * An "abstract" processor base class.
 *
 * It exists only to document the processor interface.
 */
declare const ProcessorBase: {
    new (): {
        /** @inheritDoc */
        process(context: object): ISendContext;
    };
};
export default ProcessorBase;
