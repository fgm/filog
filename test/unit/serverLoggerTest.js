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
    // maxReqListeners correctly defaulted.
    expect(logger.maxReqListeners).toBe(11);
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
      maxReqListeners: 30,
    };
    const logger = new ServerLogger(strategy, null, options);

    for (const k of Object.keys(options)) {
      expect(logger[k]).toBe(options[k]);
    }
  });
};

export {
  testConstructor,
};
