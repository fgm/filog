import * as os from "os";
import sinon = require("sinon");

import {
  IContext,
  IDetails,
  ITimestamps,
  KEY_DETAILS,
  KEY_HOST,
  KEY_SOURCE,
  KEY_TS,
} from "../../src/IContext";
import { ClientSide } from "../../src/Loggers/ClientLogger";
import { ILogger } from "../../src/Loggers/ILogger";
import {
  IServerLoggerConstructorParameters,
  ServerLogger,
  ServerSide,
} from "../../src/Loggers/ServerLogger";
import * as LogLevel from "../../src/LogLevel";
import NullFn from "../../src/NullFn";
import { IProcessor } from "../../src/Processors/IProcessor";
import { ProcessorBase } from "../../src/Processors/ProcessorBase";
import {
  IConstructor,
  IResult,
  newEmptyStrategy,
  newLogStrategy,
  TestSender,
} from "./types";

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
    expect((loggerHappy.constructor as IConstructor).name).toBe("ServerLogger");
    expect(connectSpy.calledOnce).toBe(true);

    connectSpy.resetHistory();
    const loggerSad = new ServerLogger(newEmptyStrategy(), null, {});
    expect((loggerSad.constructor as IConstructor).name).toBe("ServerLogger");
    expect(connectSpy.calledOnce).toBe(true);
  });

  test("Should register with connect with default path", () => {
    const logger = new ServerLogger(newEmptyStrategy(), mockWebApp as any, {});
    expect((logger.constructor as IConstructor).name).toBe("ServerLogger");
    expect(connectSpy.alwaysCalledWith(mockWebApp, "/logger")).toBe(true);
  });

  test("Should register with connect with chosen path", () => {
    const servePath = "/eightfold";
    const logger = new ServerLogger(newEmptyStrategy(), mockWebApp as any, { servePath });
    expect((logger.constructor as IConstructor).name).toBe("ServerLogger");
    expect(connectSpy.calledOnce).toBe(true);
    expect(connectSpy.alwaysCalledWith(mockWebApp, servePath)).toBe(true);
  });
};

const testBuildContext = () => {
  test("Should apply logger source over context", () => {
    const logger: ServerLogger = new ServerLogger(newEmptyStrategy());
    logger.side = LOG_SOURCE;
    const details: IDetails = {
      [KEY_SOURCE]: "other",
    };
    const actual = logger.getInitialContext(details);
    expect(actual).toHaveProperty(KEY_SOURCE, LOG_SOURCE);
  });

  test("Should import details as details key", () => {
    const logger = new ServerLogger(newEmptyStrategy());
    const argumentDetails = { a: "A", d: "D1" };
    const actual = logger.getInitialContext(argumentDetails);
    const expected = {
      // Argument detail overwrites context detail.
      [KEY_DETAILS]: argumentDetails,
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
      [KEY_TS]: {
        [LOG_SOURCE]: {
          [clientTsKey]: t0,
        },
      },
    };
    logger.logExtended(LogLevel.INFO, "message", sourceContext, LOG_SOURCE);
    const result: IResult = sender.result;
    expect(result).not.toHaveProperty(`context.${LOG_SOURCE}.${KEY_TS}`);
    expect(result).toHaveProperty(`context.${KEY_TS}`);
    expect(result).toHaveProperty(`context.${KEY_TS}.${LOG_SOURCE}`);
    expect(result).toHaveProperty(`context.${KEY_TS}.${LOG_SOURCE}.${clientTsKey}`);
    const actual = result.context[KEY_TS][LOG_SOURCE][clientTsKey];
    expect(actual).toBe(t0);
  });

  test("Should apply processors", () => {
    const sender = new TestSender();
    // Cast is required because this is an illegal key, which would otherwise
    // be unusable in TS: this test is only for the generated JS.
    const parameters = { foo: "bar" } as IServerLoggerConstructorParameters;
    const logger = new ServerLogger(newLogStrategy(sender), null, parameters);

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
    const initialContext: IContext = {
      [KEY_SOURCE]: LOG_SOURCE,
      [LOG_SOURCE]: {
        // Should remain.
        c: "C",
      },
      [ServerSide]: {
        // Should be overwritten twice.
        extra: "initial",
        // Should remain.
        s: "S",
      },
    };

    const hostname = os.hostname();

    logger.logExtended(LogLevel.INFO, "message", initialContext, LOG_SOURCE);
    const expectedContext: IContext = {
      // No [KEY_DETAILS]: any.
      [KEY_HOST]: hostname,
      [KEY_SOURCE]: LOG_SOURCE,
      // [KEY_TS]: more complex to match, so not included here.
      [LOG_SOURCE]: { c: "C" },
      [ServerSide]: {
        // Extra is "initial" originally, "p1" after p1, and "p2" after p2.
        extra: "p2",
        p1: "p1",
        p2: "p2",
        s: "S",
      },
    };
    const result: IResult = sender.result;
    expect(result).toHaveProperty("context");
    const actualContext: IContext = result.context;
    expect(actualContext).not.toHaveProperty(KEY_DETAILS);
    expect(actualContext).not.toHaveProperty(ClientSide);
    expect(actualContext).toHaveProperty(KEY_TS);
    const actualTs: ITimestamps = actualContext[KEY_TS];
    expect(actualTs).toHaveProperty(`${ServerSide}.log`);

    expect(actualContext).toMatchObject(expectedContext);
  });
};

export {
  testBuildContext,
  testConnect,
  testConstructor,
  testLogExtended,
};
