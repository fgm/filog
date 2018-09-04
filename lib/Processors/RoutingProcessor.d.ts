/**
 * @fileOverview Routing Processor class.
 */
import { IContext } from "../IContext";
/**
 * RoutingProcessor adds route information to logs.
 *
 * @extends ProcessorBase
 */
declare const RoutingProcessor: {
    new (): {
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
    };
};
export default RoutingProcessor;
