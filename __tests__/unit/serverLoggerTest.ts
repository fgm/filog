import sinon = require("sinon");

import {DETAILS_KEY, IContext, SOURCE_KEY, TS_KEY} from "../../src/IContext";
import {ILogger} from "../../src/Loggers/ILogger";
import { IServerLoggerConstructorParameters, ServerLogger } from "../../src/Loggers/ServerLogger";
import * as LogLevel from "../../src/LogLevel";
import NullFn from "../../src/NullFn";
import {IProcessor} from "../../src/Processors/IProcessor";
import ProcessorBase from "../../src/Processors/ProcessorBase";
import {IResult, newEmptyStrategy, newLogStrategy, TestSender} from "./types";

const LOG_SOURCE = "test";
const MAGIC = "xyzzy";

const testConstructor = () => {
  (global as any).Meteor = { methods: NullFn };

  test("Should provide default parameters", () => {
    const logger = new ServerLogger(newEmptyStrategy());
    expect(logger.enableMethod).toBe(true);
    expect(logger.logRequestHeaders).toBe(true);
    expect(logger.maxReqListeners).toBe(11);
    expect(logger.servePath).toBe("/logger");
  });

  // These tests are only relevant to non-TS code: TS would reject the calls.
  test("Should not add unknown parameters", () => {
    // Extra property on values prototype and on object itself.
    Object.prototype[MAGIC] = NullFn;
    const values = { foo: "bar" };

    const logger = new ServerLogger(newEmptyStrategy(), null, values as IServerLoggerConstructorParameters);
    delete Object.prototype[MAGIC];
    // Unknown argument from object and prototype are not set on instance.
    expect(typeof logger["foo" as keyof ILogger]).toBe("undefined");
    expect(typeof logger[MAGIC]).toBe("undefined");
  });

  test("Should not overwrite passed parameters", () => {
    const options: IServerLoggerConstructorParameters = {
      logRequestHeaders: false,
      maxReqListeners: 30,
      servePath: "nowhere",
    };
    const logger = new ServerLogger(newEmptyStrategy(), null, options);

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
    const loggerHappy = new ServerLogger(newEmptyStrategy(), mockWebApp as any, {});
    expect(loggerHappy.constructor.name).toBe("ServerLogger");
    expect(connectSpy.calledOnce).toBe(true);

    connectSpy.resetHistory();
    const loggerSad = new ServerLogger(newEmptyStrategy(), null, {});
    expect(loggerSad.constructor.name).toBe("ServerLogger");
    expect(connectSpy.calledOnce).toBe(true);
  });

  test("Should register with connect with default path", () => {
    const logger = new ServerLogger(newEmptyStrategy(), mockWebApp as any, {});
    expect(logger.constructor.name).toBe("ServerLogger");
    expect(connectSpy.alwaysCalledWith(mockWebApp, "/logger")).toBe(true);
  });

  test("Should register with connect with chosen path", () => {
    const servePath = "/eightfold";
    const logger = new ServerLogger(newEmptyStrategy(), mockWebApp as any, { servePath });
    expect(logger.constructor.name).toBe("ServerLogger");
    expect(connectSpy.calledOnce).toBe(true);
    expect(connectSpy.alwaysCalledWith(mockWebApp, servePath)).toBe(true);
  });
};

const testBuildContext = () => {
  test("Should apply logger source over context", () => {
    const logger: ServerLogger = new ServerLogger(newEmptyStrategy());
    logger.side = LOG_SOURCE;
    const details: {} = {
      [SOURCE_KEY]: "other",
    };
    const actual = logger.getInitialContext(details);
    expect(actual).toHaveProperty(SOURCE_KEY, LOG_SOURCE);
  });

  test("Should import details as details key", () => {
    const logger = new ServerLogger(newEmptyStrategy());
    const argumentDetails = { a: "A", d: "D1" };
    const actual = logger.getInitialContext(argumentDetails);
    const expected = {
      // Argument detail overwrites context detail.
      [DETAILS_KEY]: argumentDetails,
    };
    expect(actual).toMatchObject(expected);
  });
};

const testLogExtended = () => {
  let buildContextSpy;
  let defaultContextSpy;

  beforeAll(() => {
    buildContextSpy = sinon.spy(ServerLogger.prototype, "getInitialContext");
    defaultContextSpy = sinon.spy(ServerLogger.prototype, "defaultContext");
  });

  test("Should reject invalid log levels", () => {
    const logger = new ServerLogger(newEmptyStrategy());
    expect(() => {
      logger.logExtended(-1, "message", {}, LOG_SOURCE);
    }).toThrow();
  });

  test("Should default context", () => {
    const logger = new ServerLogger(newEmptyStrategy());
    logger.logExtended(LogLevel.INFO, "message", {}, LOG_SOURCE);
    expect(defaultContextSpy.calledOnce).toBe(true);
  });

  test("Should timestamp context", () => {
    const sender = new TestSender();
    const logger = new ServerLogger(newLogStrategy(sender));

    const t0 = + new Date();
    logger.logExtended(LogLevel.INFO, "message", {}, LOG_SOURCE);
    const t1 = + new Date();
    const result: IResult = sender.result;
    expect(result).toHaveProperty("context.timestamp.server.log");
    const actual = result.context.timestamp.server.log;
    expect(actual).toBeGreaterThanOrEqual(t0);
    expect(actual).toBeLessThanOrEqual(t1);
  });

  test("Should factor source timestamp", () => {
    const sender = new TestSender();
    const logger = new ServerLogger(newLogStrategy(sender));
    const t0 = + new Date();
    const clientTsKey = "whatever";
    const sourceContext = {
      [TS_KEY]: {
        [LOG_SOURCE]: {
          [clientTsKey]: t0,
        },
      },
    };
    logger.logExtended(LogLevel.INFO, "message", sourceContext, LOG_SOURCE);
    const result: IResult = sender.result;
    expect(result).not.toHaveProperty(`context.${LOG_SOURCE}.${TS_KEY}`);
    expect(result).toHaveProperty(`context.${TS_KEY}`);
    expect(result).toHaveProperty(`context.${TS_KEY}.${LOG_SOURCE}`);
    expect(result).toHaveProperty(`context.${TS_KEY}.${LOG_SOURCE}.${clientTsKey}`);
    const actual = result.context[TS_KEY][LOG_SOURCE][clientTsKey];
    expect(actual).toBe(t0);
  });

  // TODO: processors are not yet implemented in this branch.
  test.skip("Should apply processors", () => {
    const sender = new TestSender();
    const logger = new ServerLogger(newLogStrategy(sender), null, { foo: "bar" } as IServerLoggerConstructorParameters);

    const P1 = class extends ProcessorBase implements IProcessor {
      /** @inheritDoc */
      public process(context: IContext): IContext {
        return { ...context, extra: "p1", p1: "p1" };
      }
    };
    const P2 = class extends ProcessorBase implements IProcessor {
      /** @inheritDoc */
      public process(context: IContext): IContext {
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
    logger.logExtended(LogLevel.INFO, "message", initialContext, LOG_SOURCE);
    // Expected: {
    //   message_details: (..not tested here..),
    //   source: "test",
    //   test: { c: "C", extra: "initial" },
    //   server: { p1: "p1", p2: "p2", extra: "p2" }
    //   timestamp: (..not tested here..)
    // }
    const result: IResult = sender.result;
    expect(result).toHaveProperty("context");
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
