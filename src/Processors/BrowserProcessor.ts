/**
 * @fileOverview Browser Processor class.
 */
import { IContext } from "../IContext";
import { IProcessor } from "./IProcessor";
import { ProcessorBase } from "./ProcessorBase";

interface IMemoryInfo {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;

}

// Name is required for browser compatibility.
// eslint-disable-next-line
interface Performance {
  memory?: IMemoryInfo;
}

// Name is required for browser compatibility.
// eslint-disable-next-line
interface Window {
  navigator?: Navigator;
  performance: Performance;
}

interface IBrowserInfo {
  performance?: Performance | {};
  platform: string;
  userAgent: string;
}

// Name is required for browser compatibility.
// eslint-disable-next-line
interface Navigator {
  platform?: string;
  userAgent?: string;
  [key: string]: string | undefined;
}

/**
 * Adds browser related information to an event context.
 *
 * - plugins, platform, product, userAgent
 * - memory information
 *
 * @extends ProcessorBase
 */
class BrowserProcessor extends ProcessorBase implements IProcessor {
  public navigator: any;
  public window: any;

  /**
   * ProcessorBase ensures it is not being built outside a browser.
   *
   * @param {object} nav
   *   window.Navigator.
   * @param {object} win
   *   window.
   */
  constructor(nav?: Navigator, win?: Window) {
    super();
    const actualNav = nav || (typeof navigator === "object" && navigator);
    const actualWin = win || (typeof window === "object" && window);

    if (typeof actualNav !== "object" || typeof actualWin !== "object" || !actualNav || !actualWin) {
      throw new ReferenceError("BrowserProcessor is only usable on browser-run code.");
    }

    this.navigator = actualNav;
    this.window = actualWin;
  }

  /** @inheritDoc */
  public process(context: object): IContext {
    const unknown = "unknown";
    const browserDefaults: IBrowserInfo = {
      platform: unknown,
      userAgent: unknown,
    };

    // Ensure a browser key exists, using the contents from context if available.
    const result: { browser: IBrowserInfo } = {
        browser: {
          performance: this.window.performance,
          ...browserDefaults,
        },
        ...context,
      };

    // Overwrite existing browser keys in context, keeping non-overwritten ones.
    for (const key in browserDefaults) {
      if (browserDefaults.hasOwnProperty(key)) {
        result.browser[key as keyof IBrowserInfo] = this.navigator[key]
          ? this.navigator[key]
          : browserDefaults[key as keyof IBrowserInfo];
      }
    }

    result.browser.performance = (this.window.performance && this.window.performance.memory)
      ? {
          memory: {
            jsHeapSizeLimit: this.window.performance.memory.jsHeapSizeLimit,
            totalJSHeapSize: this.window.performance.memory.totalJSHeapSize,
            usedJSHeapSize: this.window.performance.memory.usedJSHeapSize,
          },
        }
      : {};

    return result;
  }
}

export {
  BrowserProcessor,
  IBrowserInfo,
  IMemoryInfo,
};
