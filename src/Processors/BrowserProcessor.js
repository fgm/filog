/**
 * @fileOverview Browser Processor class.
 */
import ProcessorBase from "./ProcessorBase";

/**
 * Adds browser related information to an event context.
 *
 * - plugins, platform, product, userAgent
 * - memory information
 *
 * @extends ProcessorBase
 */
const BrowserProcessor = class extends ProcessorBase {
  /**
   * ProcessorBase ensures it is not being built outside a browser.
   */
  constructor() {
    super();
    if (!navigator) {
      throw new Error("BrowserProcessor is only usable on browser-run code.");
    }
  }

  /** @inheritdoc */
  getTrustedKeys() {
    return ['browser'];
  }

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
    const unknown = "unknown";
    const browserDefaults = {
      platform: unknown,
      product: unknown,
      userAgent: unknown
    };

    // Ensure a browser key exists, using the contents from context if available.
    let result = Object.assign({ browser: {} }, context);

    // Overwrite existing browser keys in context, keeping non-overwritten ones.
    for (const key in browserDefaults) {
      if (browserDefaults.hasOwnProperty(key)) {
        result.browser[key] = navigator[key] ? navigator[key] : browserDefaults[key];
      }
    }

    result.browser.performance = (window.performance && window.performance.memory)
      ? window.performance.memory
      : {};

    return result;
  }
};

export default BrowserProcessor;
