import ProcessorBase from './ProcessorBase';

/**
 * Adds browser related information to an event context.
 *
 * - plugins, platform, product, userAgent
 * - memory information
 */
export default class BrowserProcessor extends ProcessorBase {
  constructor() {
    super();
    if (!navigator) {
      throw new Error('BrowserProcessor is only usable on browser-run code.');
    }
  }

  /** @inheritdoc */
  process(context) {
    const unknown = 'unknown';
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
}
