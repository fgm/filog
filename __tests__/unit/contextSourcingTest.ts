import ClientLogger from "../../src/ClientLogger";
import {
  DETAILS_KEY, HOST_KEY,
  IContext, SOURCE_KEY, TS_KEY,
} from "../../src/IContext";
import {ILogger} from "../../src/ILogger";
import { Levels } from "../../src/LogLevel";
import ServerLogger from "../../src/ServerLogger";

// Unit tests run on NodeJS, so we have access to its packages.
import { hostname } from "os";

let result;

const emptyStrategy = () => ({
  customizeLogger: () => [],
  selectSenders: () => [],
});

const TestSender = new class {
  public send(level, message, context): void {
    result = { level, message, context };
  }
}();

const logStrategy = {
  ...emptyStrategy(),
  selectSenders: () => [TestSender],
};

function testContextSourcing(): void {
  function newClientLogger(): ILogger {
    const cl: ILogger = new ClientLogger(logStrategy);
    return cl;
  }

  function newServerLogger(): ILogger {
    const sl: ILogger = new ServerLogger(logStrategy);
    return sl;
  }

  test.only("Client logging, pure", () => {
    const cl = newClientLogger();
    // Constant strings are immutable.
    const message = "some message";

    // Const objects are not immutable: catch details being overwritten.
    const details = { a: "A" };
    const expectedDetails = { ...details };

    const t1 = +new Date();
    cl.log(Levels.WARNING, message, details);
    const t2 = +new Date();

    const expected = {
      context: {
        [DETAILS_KEY]: details,
        // HOST_KEY: not on client logger.
        [SOURCE_KEY]: "client",
        // TS_KEY: Cannot test content just with toMatchObject.
      },
      level: Levels.WARNING,
      message,
    };
    expect(t2).toBeGreaterThanOrEqual(t1);
    expect(typeof result).toBe("object");
    expect(result).toMatchObject(expected);
    expect(result).toHaveProperty(TS_KEY);
    expect(typeof result[TS_KEY]).toBe("object");
    expect(result[TS_KEY]).toHaveProperty("log");
    expect(result[TS_KEY].log).toBeGreaterThanOrEqual(t1);
    expect(result[TS_KEY].log).toBeLessThanOrEqual(t2);
  });

  test.only("Server logging, pure", () => {
    const sl = newServerLogger();

    // Constant strings are immutable.
    const message = "some message";
    const host = hostname();

    // Const objects are not immutable: catch details being overwritten.
    const details = { a: "A" };
    const expectedDetails = { ...details };

    const t1 = +new Date();
    sl.log(Levels.WARNING, message, details);
    const t2 = +new Date();

    const expected = {
      context: {
        [DETAILS_KEY]: expectedDetails,
        [HOST_KEY]: host,
        [SOURCE_KEY]: "server",
        // TS_KEY: Cannot test content just with toMatchObject.
      },
      level: Levels.WARNING,
      message,
    };
    expect(t2).toBeGreaterThanOrEqual(t1);
    expect(typeof result).toBe("object");
    expect(result).toMatchObject(expected);
    expect(result).toHaveProperty(TS_KEY);
    expect(typeof result[TS_KEY]).toBe("object");
    expect(result[TS_KEY]).toHaveProperty("log");
    expect(result[TS_KEY].log).toBeGreaterThanOrEqual(t1);
    expect(result[TS_KEY].log).toBeLessThanOrEqual(t2);
  });
}

export {
  testContextSourcing,
};
