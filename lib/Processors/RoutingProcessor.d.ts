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
        process(context: object): object & {
            routing: {
                location: Location;
            };
        };
    };
};
export default RoutingProcessor;
