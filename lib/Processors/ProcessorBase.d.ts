/**
 * @fileOverview Base Processor class.
 */
/**
 * An "abstract" processor base class.
 *
 * It exists only to document the processor interface.
 */
declare const ProcessorBase: {
    new (): {
        /** @inheritDoc */
        process(context: object): object;
    };
};
export default ProcessorBase;
