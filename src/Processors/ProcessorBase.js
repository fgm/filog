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

  /**
   * Provide the list of context keys this processor recommends not serializing.
   *
   * @returns {Array}
   *   An array of context keys which will not be serialized by default if this
   *   processor is involved.
   */
  getTrustedKeys() {
    return [];
  }
};

export default ProcessorBase;
