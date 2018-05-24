import BrowserProcessor from "../../src/Processors/BrowserProcessor";

function testBrowserProcessor() {
  class Performance {
    constructor(values = {}) {
      for (const key of Object.keys(values)) {
        this[key] = values[key];
      }
    }

    toJSON() {
      return { memory: {} };
    }
  }

  let initialContext;
  let navigator = {};
  let window = {};

  beforeEach(() => {
    initialContext = { anything: "goes" };
    navigator = {};
    window = { performance: new Performance() };
  });

  test("should fail outside the browser", () => {
    expect(() => {
      const processor = new BrowserProcessor(navigator, window);
      processor.process(initialContext);
    }).not.toThrow(ReferenceError);

    expect(() => {
      const processor = new BrowserProcessor();
      processor.process(initialContext);
    }).toThrow(ReferenceError);

    expect(() => {
      const processor = new BrowserProcessor(null, null);
      processor.process(initialContext);
    }).toThrow(ReferenceError);
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

  /* This test hand-builds the MemoryInfo object in window.Performance, because
   * that class is not defined outside Chrome.
   */
  test("should serialize performance.memory correctly", () => {
    const keys = [
      "jsHeapSizeLimit",
      "totalJSHeapSize",
      "usedJSHeapSize",
    ];
    const win = Object.assign({}, { performance: new Performance({ memory: {} }) });
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
    const string = JSON.stringify(processed);
    const actual = JSON.parse(string);
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
