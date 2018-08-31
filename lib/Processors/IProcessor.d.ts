import { ISendContext } from "../ISendContext";
interface IProcessor {
    /**
     * The only required method for processor implementations.
     *
     * It assumes passed contexts are not mutated, so they are either returned as
     * such, as in this example implementation, or cloned à la Object.assign().
     *
     * @param context
     *   The context object for a log event.
     *
     * @returns
     *   The processed context object.
     */
    process(context: object): ISendContext;
}
export { IProcessor, };
