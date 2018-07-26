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
   *
   * @param {object} nav
   *   window.Navigator.
   * @param {object} win
   *   window.
   */
  constructor(nav, win) {
    super();
    let actualNav = nav || ((typeof navigator === "undefined") ? null : navigator);
    let actualWin = win || ((typeof window === "undefined") ? null : window);

    if (typeof actualNav !== "object" || typeof actualWin !== "object" || !actualNav || !actualWin) {
      throw new ReferenceError("BrowserProcessor is only usable on browser-run code.");
    }

    this.navigator = actualNav;
    this.window = actualWin;
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
      userAgent: unknown,
    };

    // Ensure a browser key exists, using the contents from context if available.
    let result = Object.assign({ browser: { performance: this.window.performance } }, context);

    // Overwrite existing browser keys in context, keeping non-overwritten ones.
    for (const key in browserDefaults) {
      if (browserDefaults.hasOwnProperty(key)) {
        result.browser[key] = this.navigator[key] || browserDefaults[key];
      }
    }

    result.browser.performance = (this.window.performance && this.window.performance.memory) ?
      {
        memory: {
          jsHeapSizeLimit: this.window.performance.memory.jsHeapSizeLimit,
          totalJSHeapSize: this.window.performance.memory.totalJSHeapSize,
          usedJSHeapSize: this.window.performance.memory.usedJSHeapSize,
        },
      } :
      {};

    return result;
  }
};

export default BrowserProcessor;
