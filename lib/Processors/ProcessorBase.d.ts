/**
 * @fileOverview Base Processor class.
 */
import { IContext } from "../IContext";
import { IProcessor } from "./IProcessor";
/**
 * An "abstract" processor base class.
 *
 * It exists only to document the processor interface.
 */
declare class ProcessorBase implements IProcessor {
    /** @inheritDoc */
    process(context: IContext): IContext;
}
export { ProcessorBase, };
