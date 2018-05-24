import BrowserProcessor from "../../src/Processors/BrowserProcessor";

function testBrowserProcessor() {
  let initialContext;
  let navigator = {};
  let window = {};

  beforeEach(() => {
    initialContext = { anything: "goes" };
    navigator = {};
    window = {};
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
}

export {
  testBrowserProcessor,
};
