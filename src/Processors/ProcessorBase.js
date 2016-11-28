/**
 * @fileOverview Base Processor class.
 */

/**
 * An "abstract" processor base class.
 *
 * It exists only to document the processor interface.
 */
const ProcessorBase = class {
  /**
   * The only required method for processor implementations.
   *
   * It assumes passed contexts are not mutated, so they are either returned as
   * such, as in this example implementation, or cloned à la Object.assign().
   *
   * @param {object} context
   *   The context object for a log event.
   *
   * @returns {object}
   *   The processed context object.
   */
  process(context) {
    return context;
  }
};

export default ProcessorBase;
