import NullFn from "../../src/NullFn";

import ServerLogger from "../../src/ServerLogger";

const testConstructor = () => {
  const strategy = {
    customizeLogger: () => [],
    selectSenders: () => [],
  };
  global.Meteor = { methods: NullFn };

  test("Should provide default parameters", () => {
    const logger = new ServerLogger(strategy);
    // logRequestHeaders correctly defaulted.
    expect(logger.logRequestHeaders).toBe(true);
    // servePath correctly defaulted.
    expect(logger.servePath).toBe("/logger");
  });

  test("Should not add unknown parameters", () => {
    const logger = new ServerLogger(strategy, null, { foo: "bar" });
    // Unknown argument foo is not set on instance.
    expect(typeof logger.foo).toBe("undefined");
  });

  test("Should not overwrite passed parameters", () => {
    const options = {
      logRequestHeaders: "foo",
      servePath: 42,
    };
    const logger = new ServerLogger(strategy, null, options);
    // logRequestHeaders not overwritten.
    expect(logger.logRequestHeaders).toBe(options.logRequestHeaders);
    // servePath not overwritten.
    expect(logger.servePath).toBe(options.servePath);
  });
};

export {
  testConstructor,
};
