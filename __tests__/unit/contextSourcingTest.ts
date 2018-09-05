import ClientLogger from "../../src/ClientLogger";
import {
  DETAILS_KEY, HOST_KEY,
  IContext, ITimestamps, ITimestampsHash, SOURCE_KEY, TS_KEY,
} from "../../src/IContext";
import {ILogger} from "../../src/ILogger";
import { Levels } from "../../src/LogLevel";
import ServerLogger from "../../src/ServerLogger";

// Unit tests run on NodeJS, so we have access to its packages.
import { hostname } from "os";
import {ISender} from "../../src/Senders/ISender";
import {IStrategy} from "../../src/Strategies/IStrategy";

type StrategyFactory = (sender?: ISender) => IStrategy;

const newEmptyStrategy: StrategyFactory = () => ({
  customizeLogger: () => [],
  selectSenders: () => [],
});

class TestSender {
  public result: IContext = {};

  public send(level, message, context): void {
    this.result = { level, message, context };
  }
}

const newLogStrategy: StrategyFactory = (sender: TestSender) => ({
  ...newEmptyStrategy(),
  selectSenders: () => [sender],
});

function testContextSourcing(): void {
  function newClientLogger(sender: ISender): ILogger {
    const cl: ILogger = new ClientLogger(newLogStrategy(sender));
    return cl;
  }

  function newServerLogger(sender: ISender): ServerLogger {
    const sl: ServerLogger = new ServerLogger(newLogStrategy(sender));
    return sl;
  }

  test("Client logging, pure, no processor", () => {
    const sender: TestSender = new TestSender();
    const cl = newClientLogger(sender);
    // Constant strings are immutable.
    const message = "some message";
    const side = "client";

    // Const objects are not immutable: catch details being overwritten.
    const details = { a: "A" };
    const expectedDetails = { ...details };

    const t1: number = +new Date();
    cl.log(Levels.WARNING, message, details);
    const t2: number = +new Date();

    const expected = {
      context: {
        [DETAILS_KEY]: details,
        // HOST_KEY: not on client contexts.
        [SOURCE_KEY]: side,
        // TS_KEY: Cannot test content just with toMatchObject.
      },
      level: Levels.WARNING,
      message,
    };
    expect(t2).toBeGreaterThanOrEqual(t1);
    const result = sender.result;
    expect(typeof result).toBe("object");
    expect(result).not.toHaveProperty(HOST_KEY);
    expect(result).toMatchObject(expected);

    const actualContext = result.context;
    // No side properties without processors.
    expect(actualContext).not.toHaveProperty(side);

    expect(actualContext).toHaveProperty(TS_KEY);
    const ts: ITimestampsHash = actualContext[TS_KEY];
    expect(typeof ts).toBe("object");
    expect(ts).toHaveProperty(side);
    expect(ts[side]).toHaveProperty("log");
    expect(ts[side].log).toBeGreaterThanOrEqual(t1);
    expect(ts[side].log).toBeLessThanOrEqual(t2);
  });

  test("Server logging, pure, no processor", () => {
    const sender: TestSender = new TestSender();
    const sl = newServerLogger(sender);

    // Constant strings are immutable.
    const message = "some message";
    const host = hostname();
    const side = "server";

    // Const objects are not immutable: catch details being overwritten.
    const details = { a: "A" };
    const expectedDetails = { ...details };

    const t1: number = +new Date();
    sl.log(Levels.WARNING, message, details);
    const t2: number = +new Date();

    const expected = {
      context: {
        [DETAILS_KEY]: expectedDetails,
        [HOST_KEY]: host,
        [SOURCE_KEY]: side,
        // TS_KEY: Cannot test content just with toMatchObject.
      },
      level: Levels.WARNING,
      message,
    };
    expect(t2).toBeGreaterThanOrEqual(t1);
    const result = sender.result;
    expect(typeof result).toBe("object");
    expect(result).toMatchObject(expected);

    const actualContext = result.context;
    expect(actualContext).toHaveProperty(TS_KEY);
    const ts: ITimestampsHash = actualContext[TS_KEY];
    expect(typeof ts).toBe("object");
    expect(ts).toHaveProperty(side);
    expect(ts[side]).toHaveProperty("log");
    expect(ts[side].log).toBeGreaterThanOrEqual(t1);
    expect(ts[side].log).toBeLessThanOrEqual(t2);
  });

  test("Server logging from client log, no processor", () => {
    const sender: TestSender = new TestSender();
    const sl = newServerLogger(sender);

    // Constant strings are immutable.
    const message = "some message";
    const host = hostname();

    // Const objects are not immutable: catch details being overwritten.
    const details = { a: "A" };
    const expectedDetails = { ...details };

    const clientContext: IContext = {
      processorObject: { foo: "bar" },
      processorScalar: "baz",
    };
    const expectedClientContext = { ...clientContext };

    const side: string = "client";

    // Go back in time to ensure sequencing t1 < client log < client send < t2.
    const t1: number = +new Date() - 3;

    const initialContext = {
      [DETAILS_KEY]: expectedDetails,
      // HOST_KEY: not on client contexts.
      [TS_KEY]: {
        [side]: {
          log: t1 + 1,
          send: t1 + 2,
        } as ITimestamps,
        // No "server" yet.
      } as ITimestampsHash,
      [SOURCE_KEY]: side,
      [side]: clientContext,
    };

    sl.logExtended(Levels.WARNING, message, initialContext, "client");
    const t2: number = +new Date();

    const expected = {
      context: {
        [DETAILS_KEY]: expectedDetails,
        [HOST_KEY]: host,
        [SOURCE_KEY]: side,
        // TS_KEY: Cannot test content just with toMatchObject.
        [side]: expectedClientContext,
        // No "server" content without a server processor.
      },
      level: Levels.WARNING,
      message,
    };

    expect(t2).toBeGreaterThanOrEqual(t1);
    const result = sender.result;

    expect(typeof result).toBe("object");
    expect(result).toMatchObject(expected);

    const actualContext = result.context;
    // No side property without a processor.
    expect(actualContext).not.toHaveProperty("server");

    expect(actualContext).toHaveProperty(TS_KEY);
    const ts: ITimestampsHash = actualContext[TS_KEY];
    expect(typeof result[TS_KEY]).toBe("object");
    expect(typeof ts).toBe("object");
    expect(ts).toHaveProperty(side);
    expect(ts).toHaveProperty("server");
    expect(ts.server).toHaveProperty("log");
    expect(ts.server.log).toBeGreaterThanOrEqual(t1);
    expect(ts.server.log).toBeLessThanOrEqual(t2);
  });
}

export {
  testContextSourcing,
};
