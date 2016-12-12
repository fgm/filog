/**
 * @fileOverview Routing Processor class.
 */
import ProcessorBase from "./ProcessorBase";

/**
 * RoutingProcessor adds route information to logs.
 *
 * @extends ProcessorBase
 */
const RoutingProcessor = class extends ProcessorBase {
  /**
   * Constructor ensures the processor is used in a browser context.
   */
  constructor() {
    super();
    if (!window || !window.location) {
      throw new Error("Cannot provide route information without location information.");
    }
  }

  /** @inheritdoc */
  getTrustedKeys() {
    return ['routing'];
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
  process(context) {
    let result = Object.assign({}, context, { routing: { location: window.location } });
    return result;
  }
};

export default RoutingProcessor;
