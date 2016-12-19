/** global: jest */

const sinon = require("sinon");

import NullFn from "../../src/NullFn";

import ServerLogger from "../../src/ServerLogger";

const testConstructor = () => {
  const strategy = {
    customizeLogger: () => [],
    customizeSenders: () => [],
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

const testConnect = () => {
  let connectSpy;
  const mockWebApp = {
    connectHandlers: {
      use: NullFn,
    },
  };

  const strategy = {
    customizeLogger: () => [],
    selectSenders: () => [],
  };

  afterEach(() => {
    connectSpy.resetHistory();
  });

  beforeAll(() => {
    connectSpy = sinon.spy(ServerLogger.prototype, "setupConnect");
  });

  test("Should only register with connect when WebApp is passed", () => {
    const loggerHappy = new ServerLogger(strategy, mockWebApp, {});
    expect(loggerHappy.constructor.name).toBe("ServerLogger");
    expect(connectSpy.calledOnce).toBe(true);

    connectSpy.resetHistory();
    const loggerSad = new ServerLogger(strategy, null, {});
    expect(loggerSad.constructor.name).toBe("ServerLogger");
    expect(connectSpy.calledOnce).toBe(true);
  });

  test("Should register with connect with default path", () => {
    const logger = new ServerLogger(strategy, mockWebApp, {});
    expect(logger.constructor.name).toBe("ServerLogger");
    expect(connectSpy.alwaysCalledWith(mockWebApp, "/logger")).toBe(true);
  });

  test("Should register with connect with chosen path", () => {
    const servePath = "/eightfold";
    const logger = new ServerLogger(strategy, mockWebApp, { servePath });
    expect(logger.constructor.name).toBe("ServerLogger");
    expect(connectSpy.calledOnce).toBe(true);
    expect(connectSpy.alwaysCalledWith(mockWebApp, servePath)).toBe(true);
  });
};


export {
  testConnect,
  testConstructor,
};
