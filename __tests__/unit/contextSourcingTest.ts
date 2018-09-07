import {
  IContext,
  IDetails,
  ITimestamps,
  KEY_DETAILS,
  KEY_HOST,
  KEY_SOURCE,
  KEY_TS,
} from "../../src/IContext";
import { ClientLogger } from "../../src/Loggers/ClientLogger";
import {ILogger} from "../../src/Loggers/ILogger";
import {ServerLogger} from "../../src/Loggers/ServerLogger";
import {Levels} from "../../src/LogLevel";
import {ISender} from "../../src/Senders/ISender";
import { newLogStrategy, TestSender } from "./types";

// Unit tests run on NodeJS, so we have access to its packages.
import {hostname} from "os";

function testContextSourcing(): void {
  function newClientLogger(sender: ISender): ILogger {
    return new ClientLogger(newLogStrategy(sender));
  }

  function newServerLogger(sender: ISender): ServerLogger {
    return new ServerLogger(newLogStrategy(sender));
  }

  test("Client logging, pure, no processor", () => {
    const sender: TestSender = new TestSender();
    const cl = newClientLogger(sender);
    // Constant scalars are immutable.
    const level = Levels.WARNING;
    const message = "some message";
    const side = "client";

    // Const objects are not immutable: catch details being overwritten.
    const details: IDetails = { a: "A" };
    const expectedDetails: IDetails = { ...details };

    const t1: number = +new Date();
    cl.log(level, message, details);
    const t2: number = +new Date();

    const expected = {
      context: {
        [KEY_DETAILS]: expectedDetails,
        // KEY_HOST: not on client contexts.
        [KEY_SOURCE]: side,
        // KEY_TS: Cannot test content just with toMatchObject.
      },
      level,
      message,
    };
    expect(t2).toBeGreaterThanOrEqual(t1);
    const result = sender.result;
    expect(typeof result).toBe("object");
    expect(result).not.toHaveProperty(KEY_HOST);
    expect(result).toMatchObject(expected);

    const actualContext = result.context;
    // No side properties without processors.
    expect(actualContext).not.toHaveProperty(side);

    expect(actualContext).toHaveProperty(KEY_TS);
    const ts: ITimestamps = actualContext[KEY_TS];
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
    const level = Levels.WARNING;
    const message = "some message";
    const host = hostname();
    const side = "server";

    // Const objects are not immutable: catch details being overwritten.
    const details: IDetails = { a: "A" };
    const expectedDetails: IDetails = { ...details };

    const t1: number = +new Date();
    sl.log(level, message, details);
    const t2: number = +new Date();

    const expected = {
      context: {
        [KEY_DETAILS]: expectedDetails,
        [KEY_HOST]: host,
        [KEY_SOURCE]: side,
        // KEY_TS: Cannot test content just with toMatchObject.
      },
      level,
      message,
    };
    expect(t2).toBeGreaterThanOrEqual(t1);
    const result = sender.result;
    expect(typeof result).toBe("object");
    expect(result).toMatchObject(expected);

    const actualContext = result.context;
    expect(actualContext).toHaveProperty(KEY_TS);
    const ts: ITimestamps = actualContext[KEY_TS];
    expect(typeof ts).toBe("object");
    expect(ts).toHaveProperty(side);
    expect(ts[side]).toHaveProperty("log");
    expect(ts[side].log).toBeGreaterThanOrEqual(t1);
    expect(ts[side].log).toBeLessThanOrEqual(t2);
  });

  test("Server logging from client log, no processor", () => {
    const sender: TestSender = new TestSender();
    const sl = newServerLogger(sender);

    // Constant scalars are immutable.
    const level = Levels.WARNING;
    const message = "some message";
    const host = hostname();

    // Const objects are not immutable: catch details being overwritten.
    const details: IDetails = { a: "A" };
    const expectedDetails: IDetails = { ...details };

    const clientContext: IContext = {
      processorObject: { foo: "bar" },
      processorScalar: "baz",
    };
    const expectedClientContext = { ...clientContext };

    const side: string = "client";

    // Go back in time to ensure sequencing t1 < client log < client send < t2.
    const t1: number = +new Date() - 3;

    const initialContext = {
      [KEY_DETAILS]: expectedDetails,
      // KEY_HOST: not on client contexts.
      [KEY_TS]: {
        [side]: {
          log: t1 + 1,
          send: t1 + 2,
        },
        // No "server" yet.
      } as ITimestamps,
      [KEY_SOURCE]: side,
      [side]: clientContext,
    };

    sl.logExtended(level, message, initialContext, side);
    const t2: number = +new Date();

    const expected = {
      context: {
        [KEY_DETAILS]: expectedDetails,
        [KEY_HOST]: host,
        [KEY_SOURCE]: side,
        // KEY_TS: Cannot test content just with toMatchObject.
        [side]: expectedClientContext,
        // No "server" content without a server processor.
      },
      level,
      message,
    };

    expect(t2).toBeGreaterThanOrEqual(t1);
    const result = sender.result;

    expect(typeof result).toBe("object");
    expect(result).toMatchObject(expected);

    const actualContext = result.context;
    // No side property without a processor.
    expect(actualContext).not.toHaveProperty("server");

    expect(actualContext).toHaveProperty(KEY_TS);
    const ts: ITimestamps = actualContext[KEY_TS];
    expect(typeof actualContext[KEY_TS]).toBe("object");
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
