import NullFn from "../../src/NullFn";
import { BrowserProcessor } from "../../src/Processors/BrowserProcessor";

interface IPerformanceWindow {
  performance: any;
}

/* This test hand-builds the MemoryInfo object in window.Performance, because
 * that class is not defined outside Chrome.
 */
function testBrowserProcessor() {
  let initialContext: {};
  let navigator = {};
  let window: IPerformanceWindow;

  beforeEach(() => {
    initialContext = { anything: "goes" };
    navigator = {};
    window = { performance: new Performance() };
  });

  test("should fail outside the browser", () => {
    let processor;
    expect(() => {
      processor = new BrowserProcessor(navigator, window);
      processor.process(initialContext);
    }).not.toThrow(ReferenceError);

    processor = null;
    expect(() => {
      processor = new BrowserProcessor(undefined, undefined);
    }).toThrow(ReferenceError);
    expect(processor).toBeNull();

    processor = null;
    expect(() => {
      // These are invalid values which TS wouldn't allow, so we have to use the
      // type cast to enable the test to run in the compiled JS.
      processor = new BrowserProcessor(null as any, null as any);
    }).toThrow(ReferenceError);
    expect(processor).toBeNull();
  });

  test("should at least return defaults", () => {
    const processor = new BrowserProcessor(navigator, window);
    expect(processor).toBeInstanceOf(BrowserProcessor);

    const actual = processor.process(initialContext);
    expect(actual).toHaveProperty("browser");
    expect(actual).toHaveProperty("browser.platform");
    expect(actual).toHaveProperty("browser.userAgent");
    expect(actual).not.toHaveProperty("browser.product");
  });

  test("Should ignore extra defaults on browser", () => {
    const MAGIC = "xyzzy";
    const win: IPerformanceWindow = { performance: new Performance() };
    win.performance.memory = {
      jsHeapSizeLimit: 1,
      totalJSHeapSize: 2,
      usedJSHeapSize: 3,
    };

    const processor = new BrowserProcessor(navigator, win);
    Object.prototype[MAGIC] = NullFn;
    const processed = processor.process(initialContext);
    expect(processed).toHaveProperty("browser");
    delete Object.prototype[MAGIC];
    const browser = processed.browser;
    expect(browser).not.toHaveProperty(MAGIC);
  });

  test("should serialize performance.memory correctly", () => {
    const keys = [
      "jsHeapSizeLimit",
      "totalJSHeapSize",
      "usedJSHeapSize",
    ];
    const win: IPerformanceWindow = {
      performance: new Performance(),
    };
    win.performance.memory = {
      jsHeapSizeLimit: 1,
      totalJSHeapSize: 2,
      usedJSHeapSize: 3,
    };

    const processor = new BrowserProcessor(navigator, win);
    expect(processor).toBeInstanceOf(BrowserProcessor);

    // Ensure sub-keys are actually present in the Performance object.
    const processed = processor.process(initialContext);
    expect(processed).toHaveProperty("browser");
    expect(processed).toHaveProperty("browser.performance");
    expect(processed).toHaveProperty("browser.performance.memory");
    for (const key of keys) {
      expect(processed).toHaveProperty(`browser.performance.memory.${key}`);
    }

    // Ensure they are available after serialization by parsing the serialized result.
    const stringified = JSON.stringify(processed);
    const actual = JSON.parse(stringified);
    expect(actual).toHaveProperty("browser");
    expect(actual).toHaveProperty("browser.performance");
    expect(actual).toHaveProperty("browser.performance.memory");
    for (const key of keys) {
      expect(actual).toHaveProperty(`browser.performance.memory.${key}`);
    }
  });
}

export {
  testBrowserProcessor,
};
