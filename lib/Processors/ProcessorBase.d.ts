/**
 * @fileOverview Base Processor class.
 */
import { IContext } from "../IContext";
/**
 * An "abstract" processor base class.
 *
 * It exists only to document the processor interface.
 */
declare const ProcessorBase: {
    new (): {
        /** @inheritDoc */
        process(context: IContext): IContext;
    };
};
export default ProcessorBase;
