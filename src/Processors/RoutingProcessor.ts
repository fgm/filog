/**
 * @fileOverview Routing Processor class.
 */
import {IContext} from "../IContext";
import {IProcessor} from "./IProcessor";
import { ProcessorBase } from "./ProcessorBase";

/**
 * RoutingProcessor adds route information to logs.
 *
 * @extends ProcessorBase
 */
class RoutingProcessor extends ProcessorBase implements IProcessor {
  /**
   * Constructor ensures the processor is used in a browser context.
   */
  constructor() {
    super();
    if (!window || !window.location) {
      throw new Error("Cannot provide route information without location information.");
    }
  }

  /**
   * Overwrite any previous routing information in context.
   *
   * @param {object} context
   *   The context object for a log event.
   *
   * @returns {object}
   *   The processed context object.
   */
  public process(context: IContext): IContext {
    const result = Object.assign({}, context, { routing: { location: window.location } });
    return result;
  }
}

export {
  RoutingProcessor,
};
