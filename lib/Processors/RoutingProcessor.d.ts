/**
 * @fileOverview Routing Processor class.
 */
import { IContext } from "../IContext";
import { IProcessor } from "./IProcessor";
import { ProcessorBase } from "./ProcessorBase";
/**
 * RoutingProcessor adds route information to logs.
 *
 * @extends ProcessorBase
 */
declare class RoutingProcessor extends ProcessorBase implements IProcessor {
    /**
     * Constructor ensures the processor is used in a browser context.
     */
    constructor();
    /**
     * Overwrite any previous routing information in context.
     *
     * @param {object} context
     *   The context object for a log event.
     *
     * @returns {object}
     *   The processed context object.
     */
    process(context: IContext): IContext;
}
export { RoutingProcessor, };
