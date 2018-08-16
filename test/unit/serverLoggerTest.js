/** global: jest */

const sinon = require("sinon");

import NullFn from "../../src/NullFn";

import Logger from "../../src/Logger";
import LogLevel from "../../src/LogLevel";
import ProcessorBase from "../../src/Processors/ProcessorBase";
import ServerLogger from "../../src/ServerLogger";

const emptyStrategy = () => ({
  customizeLogger: () => [],
  selectSenders: () => [],
});

const LOG_SOURCE = "test";
const MAGIC = "xyzzy";

let result;
const TestSender = new class {
  send(level, message, context) {
    result = { level, message, context };
  }
}();
const logStrategy = { ...emptyStrategy(), selectSenders: () => [TestSender] };

const testConstructor = () => {
  global.Meteor = { methods: NullFn };

  test("Should provide default parameters", () => {
    const logger = new ServerLogger(emptyStrategy());
    expect(logger.enableMethod).toBe(true);
    expect(logger.logRequestHeaders).toBe(true);
    expect(logger.maxReqListeners).toBe(11);
    expect(logger.servePath).toBe("/logger");
  });

  test("Should not add unknown parameters", () => {
    // Extra property on values prototype and on object itself.
    Object.prototype[MAGIC] = NullFn;
    const values = { foo: "bar" };

    const logger = new ServerLogger(emptyStrategy(), null, values);
    delete Object.prototype[MAGIC];
    // Unknown argument from object and prototype are not set on instance.
    expect(typeof logger.foo).toBe("undefined");
    expect(typeof logger[MAGIC]).toBe("undefined");
  });

  test("Should not overwrite passed parameters", () => {
    const options = {
      logRequestHeaders: "foo",
      servePath: 42,
      maxReqListeners: 30,
    };
    const logger = new ServerLogger(emptyStrategy(), null, options);

    for (const k of Object.keys(options)) {
      expect(logger[k]).toBe(options[k]);
    }
  });
};

const testConnect = () => {
  let connectSpy;
  const mockWebApp = {
    connectHandlers: {
      use: NullFn,
    },
  };

  afterEach(() => {
    connectSpy.resetHistory();
  });

  beforeAll(() => {
    connectSpy = sinon.spy(ServerLogger.prototype, "setupConnect");
  });

  test("Should only register with connect when WebApp is passed", () => {
    const loggerHappy = new ServerLogger(emptyStrategy(), mockWebApp, {});
    expect(loggerHappy.constructor.name).toBe("ServerLogger");
    expect(connectSpy.calledOnce).toBe(true);

    connectSpy.resetHistory();
    const loggerSad = new ServerLogger(emptyStrategy(), null, {});
    expect(loggerSad.constructor.name).toBe("ServerLogger");
    expect(connectSpy.calledOnce).toBe(true);
  });

  test("Should register with connect with default path", () => {
    const logger = new ServerLogger(emptyStrategy(), mockWebApp, {});
    expect(logger.constructor.name).toBe("ServerLogger");
    expect(connectSpy.alwaysCalledWith(mockWebApp, "/logger")).toBe(true);
  });

  test("Should register with connect with chosen path", () => {
    const servePath = "/eightfold";
    const logger = new ServerLogger(emptyStrategy(), mockWebApp, { servePath });
    expect(logger.constructor.name).toBe("ServerLogger");
    expect(connectSpy.calledOnce).toBe(true);
    expect(connectSpy.alwaysCalledWith(mockWebApp, servePath)).toBe(true);
  });
};

const testBuildContext = () => {
  test("Should apply argument source over context", () => {
    const logger = new ServerLogger(emptyStrategy());
    const actual = logger.buildContext({}, LOG_SOURCE, { [Logger.KEY_SOURCE]: "other" });
    expect(actual).toHaveProperty(Logger.KEY_SOURCE, LOG_SOURCE);
  });

  test("Should merge details, applying argument over context", () => {
    const logger = new ServerLogger(emptyStrategy());
    const argumentDetails = { a: "A", d: "D1" };
    const initialContext = { [Logger.KEY_DETAILS]: { b: "B", d: "D2" } };
    const actual = logger.buildContext(argumentDetails, LOG_SOURCE, initialContext);
    const expected = {
      // Argument detail overwrites context detail.
      [Logger.KEY_DETAILS]: { a: "A", b: "B", d: "D1" },
    };
    expect(actual).toMatchObject(expected);
  });

  test("Should merge context", () => {
    const logger = new ServerLogger(emptyStrategy());
    const initialContext = { foo: "bar" };
    const actual = logger.buildContext({}, LOG_SOURCE, initialContext);
    expect(actual).toMatchObject({ [LOG_SOURCE]: initialContext });
  });
};

const testLogExtended = () => {
  let buildContextSpy;

  beforeAll(() => {
    buildContextSpy = sinon.spy(ServerLogger.prototype, "buildContext");
  });

  test("Should reject invalid log levels", () => {
    const logger = new ServerLogger(emptyStrategy());
    expect(() => {
      logger.logExtended(-1, "message", {}, {}, LOG_SOURCE);
    }).toThrow();
  });

  test("Should build context", () => {
    const logger = new ServerLogger(emptyStrategy());
    logger.logExtended(LogLevel.INFO, "message", {}, {}, LOG_SOURCE);
    expect(buildContextSpy.calledOnce).toBe(true);
  });

  test("Should timestamp context", () => {
    const logger = new ServerLogger(logStrategy);
    const t0 = + new Date();
    logger.logExtended(LogLevel.INFO, "message", {}, {}, LOG_SOURCE);
    const t1 = + new Date();
    expect(result).toHaveProperty('context.timestamp.server.log');
    const actual = result.context.timestamp.server.log;
    expect(actual).toBeGreaterThanOrEqual(t0);
    expect(actual).toBeLessThanOrEqual(t1);
  });

  test.only("Should factor source timestamp", () => {
    const logger = new ServerLogger(logStrategy);
    const t0 = + new Date();
    const clientTsKey = 'whatever';
    const sourceContext = {
      [Logger.KEY_TS]: {
        [LOG_SOURCE]: {
          [clientTsKey]: t0,
        },
      },
    };
    logger.logExtended(LogLevel.INFO, "message", {}, sourceContext, LOG_SOURCE);
    expect(result).not.toHaveProperty(`context.${LOG_SOURCE}.${Logger.KEY_TS}`);
    expect(result).toHaveProperty(`context.${Logger.KEY_TS}`);
    expect(result).toHaveProperty(`context.${Logger.KEY_TS}.${LOG_SOURCE}`);
    expect(result).toHaveProperty(`context.${Logger.KEY_TS}.${LOG_SOURCE}.${clientTsKey}`);
    const actual = result.context[Logger.KEY_TS][LOG_SOURCE][clientTsKey];
    expect(actual).toBe(t0);
  });

  test("Should apply processors", () => {
    const logger = new ServerLogger(logStrategy, null, { foo: "bar" });
    const P1 = class extends ProcessorBase {
      process(context) {
        return { ...context, extra: "p1", p1: "p1" };
      }
    };
    const P2 = class extends ProcessorBase {
      process(context) {
        return { ...context, extra: "p2", p2: "p2" };
      }
    };
    logger.processors.push(new P1());
    logger.processors.push(new P2());
    const initialContext = {
      // Should remain.
      c: "C",
      // Should be overwritten twice.
      extra: "initial",
    };
    logger.logExtended(LogLevel.INFO, "message", { "some": "detail" }, initialContext, LOG_SOURCE);
    // Expected: {
    //   message_details: (..not tested here..),
    //   source: "test",
    //   test: { c: "C", extra: "initial" },
    //   server: { p1: "p1", p2: "p2", extra: "p2" }
    //   timestamp: (..not tested here..)
    // }
    expect(result).toHaveProperty('context');
    const actual = result.context;
    expect(actual).not.toHaveProperty("c");
    expect(actual).not.toHaveProperty("p1");
    expect(actual).not.toHaveProperty("p2");
    expect(actual).not.toHaveProperty("extra");
    expect(actual).toHaveProperty(LOG_SOURCE, initialContext);
    expect(actual).toHaveProperty(ServerLogger.side);
    expect(actual[ServerLogger.side]).toHaveProperty("p1", "p1");
    expect(actual[ServerLogger.side]).toHaveProperty("p2", "p2");
    expect(actual[ServerLogger.side]).toHaveProperty("extra", "p2");
  });
};

export {
  testBuildContext,
  testConnect,
  testConstructor,
  testLogExtended,
};
