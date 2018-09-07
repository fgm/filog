import * as os from "os";

import {
  IContext, IDetails,
  KEY_DETAILS, KEY_HOST,
  KEY_SOURCE,
  KEY_TS,
} from "../../src/IContext";
import {ILogger} from "../../src/Loggers";
import { Logger } from "../../src/Loggers/Logger";
import { ServerLogger } from "../../src/Loggers/ServerLogger";
import * as LogLevel from "../../src/LogLevel";
import { IProcessor } from "../../src/Processors/IProcessor";
import { ProcessorBase } from "../../src/Processors/ProcessorBase";
import {
  newEmptyStrategy,
  newLogStrategy,
  TEST_SOURCE,
  TestSender,
} from "./types";

function testImmutableContext() {
  test("should not modify context in log() calls", () => {
    const logger = new Logger(newEmptyStrategy());
    logger.side = "test";
    const originalContext = {};
    const context = { ...originalContext };

    let actual = JSON.stringify(context);
    let expected = JSON.stringify(originalContext);
    // Pre-log context matches original context
    expect(actual).toBe(expected);

    logger.log(LogLevel.DEBUG, "some message", context);

    actual = JSON.stringify(context);
    expected = JSON.stringify(originalContext);
    // Post-log context matches original context
    expect(actual).toBe(expected);
  });
}

function testMessageContext() {
  const referenceContext = () => ({ a: "A" });

  /**
   * log(..., { a: 1 }) should ...
   *
   * - log { message_details: { a: 1} }.
   */
  test(`should add the message argument to ${KEY_DETAILS}`, () => {
    const testSender: TestSender = new TestSender();
    const logger = new Logger(newLogStrategy(testSender));
    logger.log(LogLevel.DEBUG, "some message", referenceContext());

    const actualDetails = testSender.result.context[KEY_DETAILS];
    const expected = "A";
    // Message details is set
    expect(actualDetails).toHaveProperty("a", expected);
  });

  /**
   * log(..., { a: 1 }) should ...
   *
   * - NOT log { a: 1 }.
   */
  test("should not add the message arguments to context root", () => {
    const sender = new TestSender();
    const logger = new Logger(newLogStrategy(sender));
    logger.log(LogLevel.DEBUG, "some message", referenceContext());

    const actual = sender.result.context.hasOwnProperty("a");
    const expected = false;
    // Message details is set
    expect(actual).toBe(expected);
  });

  /**
   * log(..., { a: "A", message_details: { foo: "bar" } }) should...
   *
   * - log { message_details: { a: "A", message_details: { foo: "bar" } } },
   *   unlike the message_details merging it did until 0.1.18 included.
   */
  test(`should not merge contents of existing ${KEY_DETAILS} context key`, () => {
    const sender = new TestSender();
    const logger = new Logger(newLogStrategy(sender));
    const originalContext = { [KEY_DETAILS]: { foo: "bar" }, ...referenceContext() };
    logger.log(LogLevel.DEBUG, "some message", originalContext);

    const actual = sender.result.context;
    expect(actual).not.toHaveProperty("a");
    expect(actual).not.toHaveProperty("foo");
    expect(actual).toHaveProperty(KEY_DETAILS);

    // Original top-level keys should still be in top [KEY_DETAILS].
    const actualDetails = actual[KEY_DETAILS];
    expect(actualDetails).toHaveProperty("a", "A");
    expect(actualDetails).toHaveProperty(KEY_DETAILS);
    expect(actualDetails).not.toHaveProperty("foo");

    // Key nested in original message_detail should remain in place.
    const actualNested = actualDetails[KEY_DETAILS];
    expect(actualNested).not.toHaveProperty("a", "A");
    expect(actualNested).not.toHaveProperty(KEY_DETAILS);
    expect(actualNested).toHaveProperty("foo", "bar");
  });

  /**
   * log(..., { a: "A", message_details: { a: "A" } }) should...
   *
   * - log { message_details: { a: "A", message_details: { a: "A" } } },
   *   unlike the message_details merging it did until 0.1.18 included.
   */
  test(`should not merge existing ${KEY_DETAILS} context key itself`, () => {
    const sender = new TestSender();
    const logger = new Logger(newLogStrategy(sender));

    const originalContext = { [KEY_DETAILS]: { a: "A" }, ...referenceContext()  };
    logger.log(LogLevel.DEBUG, "some message", originalContext);

    // Message_details should only contain a nested [KEY_DETAILS].
    const actual = sender.result.context;
    const keys = Object.keys(actual).sort();
    expect(keys.length).toBe(3);
    expect(keys).toEqual([KEY_DETAILS, KEY_SOURCE, KEY_TS]);
    expect(actual).toHaveProperty(KEY_DETAILS);

    // Original top-level keys should still be in top [KEY_DETAILS].
    const actualDetails = actual[KEY_DETAILS];
    expect(Object.keys(actualDetails).length).toBe(2);
    expect(actualDetails).toHaveProperty("a", "A");
    expect(actualDetails).toHaveProperty(KEY_DETAILS);

    // Key nested in original message_detail should remain in place.
    const actualNested = actualDetails[KEY_DETAILS];
    expect(Object.keys(actualNested).length).toBe(1);
    expect(actualNested).toHaveProperty("a", "A");
  });

  /**
   * log(..., { a: "A", message_details: { a: "B" } }) should ...
   *
   * - log { message_details: { a: "A", message_details: { a: "B" } } }.
   */
  test(`should not merge keys within ${KEY_DETAILS}`, () => {
    const sender = new TestSender();
    const logger = new Logger(newLogStrategy(sender));
    const originalContext = { [KEY_DETAILS]: { a: "B" }, ...referenceContext() };
    logger.log(LogLevel.DEBUG, "some message", originalContext);

    // [KEY_DETAILS] should contain the newly added value for key "a", not the
    // one present in the initial [KEY_DETAILS].
    const actualDetails: { a?: any } = sender.result.context[KEY_DETAILS];
    const expected = "A";
    // Message details are set.
    expect(actualDetails).toHaveProperty("a", expected);
  });
}

function testObjectifyContext() {
  const objectifyContext = ServerLogger.objectifyContext;

  test("should convert arrays to POJOs", () => {
    const a = ["a", "b"];
    const o = objectifyContext(a);

    let actual = typeof o;
    let expected = "object";
    expect(actual).toBe(expected);

    actual = o.constructor.name;
    expected = "Object";
    expect(actual).toBe(expected);
  });

  test("should convert scalars to POJOs with a value key", () => {
    const scalars = [
      "Hello, world", "",
      42, +0, -0, 0, NaN, -Infinity, +Infinity,
      null,
      true, false,
      // eslint-disable-next-line no-undefined
      undefined,
    ];

    scalars.forEach((v) => {
      const objectified = objectifyContext(v);
      // const printable = JSON.stringify(objectified);

      let actual: string | number | boolean | null | undefined = typeof objectified;
      let expected: string | number | boolean | null | undefined = "object";
      // `Result type is "object" for ${printable}.`);
      expect(actual).toBe(expected);

      actual = objectified.constructor.name;
      expected = "Object";
      // Result constructor is "Object" for ${printable}.
      expect(actual).toBe(expected);

      const actualKeys = Object.keys(objectified);
      actual = actualKeys.length;
      expected = 1;
      // Result has a single key for ${printable}.
      expect(actual).toBe(expected);

      actual = actualKeys[0];
      expected = "value";
      // Result key is called "value" for ${printable}.
      expect(actual).toBe(expected);

      actual = objectified.value;
      expected = v;
      // Result value is the original value for ${printable}.
      expect(actual).toBe(expected);
    });
  });

  test("should not modify existing POJOs", () => {
    const raw = { a: "b" };
    const actual = objectifyContext(raw);
    const expected = { ...raw };
    expect(actual).toEqual(expected);
  });

  test("should convert date objects to ISO date strings", () => {
    const d = new Date(Date.UTC(2016, 5, 24, 16, 0, 30, 250));
    const objectified = objectifyContext(d);

    let actual = typeof objectified;
    let expected = "string";
    // Result for date object is a string
    expect(actual).toBe(expected);

    actual = objectified;
    expected = d.toISOString();
    // 2016-05-24T16:00:30.250Z : Result is the ISO representation of the date
    expect(actual).toBe(expected);
  });

  // This test checks boxing/unboxing, so disable TSlint about it.
  test("should downgrade boxing classes to underlying primitives", () => {
    // tslint:disable no-construct
    const expectations = [
      // Primitive, boxed.
      [true, new Boolean(true)],
      [1E15, new Number(1E15)],
      ["😂 hello, α world", new String("😂 hello, α world")],
    ];
    // tslint:enable no-construct

    for (const [primitive, boxed] of expectations) {
      expect(typeof boxed).toBe("object");
      const actual = objectifyContext(boxed);
      expect(actual).toBe(primitive);
    }
  });

  test("should downgrade miscellaneous classed objects to POJOs", () => {
    const value = "foo";
    class Foo {
      public k;
      constructor(v) {
        this.k = v;
      }
    }
    const initial = new Foo(value);

    let actual: string = typeof initial;
    let expected: string | Foo = "object";
    expect(actual).toBe(expected);

    interface IConstructor extends Function {
      name: string;
    }
    actual = (initial.constructor as IConstructor).name;
    expected = "Foo";
    expect(actual).toBe(expected);

    const objectified = objectifyContext(initial);

    actual = JSON.stringify(Object.keys(objectified));
    expected = JSON.stringify(["k"]);
    // Result has same properties as initial object
    expect(actual).toBe(expected);

    actual = objectified.k;
    expected = value;
    // Result has same values as initial object
    expect(actual).toBe(expected);

    actual = typeof objectified;
    expected = "object";
    // Result is an object
    expect(actual).toBe(expected);

    actual = objectified.constructor.name;
    expected = "Object";
    // Result constructor is \"Object\".
    expect(actual).toBe(expected);

    actual = objectified;
    expected = initial;
    // Result is not the initial object itself.
    expect(actual).not.toBe(expected);

    actual = objectified;
    expected = initial;
    // Result equals the initial object (Jest equal only compares values).
    expect(actual).toEqual(expected);
  });
}

function testProcessors() {
  let details: IDetails;
  let sender: TestSender;
  let logger: ILogger;

  const Adder = class extends ProcessorBase implements IProcessor {
    public process(context) {
      return { added: "value", ...context };
    }
  };

  const Modifier = class extends ProcessorBase implements IProcessor {
    public process(context) {
      context.initial = "cost";
      return context;
    }
  };

  const Remover = class extends ProcessorBase implements IProcessor {
    public process(context) {
      const { added, initial, ...rest } = context;
      return rest;
    }
  };

  /**
   * Class Purger attempts to remove all known properties from the context.
   *
   * Look at the timestamp test.
   */
  const Purger = class extends ProcessorBase implements IProcessor {
    public process(context) {
      return {};
    }
  };

  const TimeWarp = class extends ProcessorBase {
    public readonly HOST = "remote";

    // Let's do the time warp again.
    public process(context: IContext): IContext {
      context[KEY_TS] = {
        test: { log: +new Date("1978-11-19 05:00:00") },
      };
      context[KEY_HOST] = this.HOST;
      return context;
    }
  };

  beforeEach(() => {
    details = { initial: "initial" };
    sender = new TestSender();
    logger = new Logger(newLogStrategy(sender));
    logger.side = TEST_SOURCE;
  });

  test("processors should be able to modify the content of ordinary existing keys", () => {
    logger.processors.push(new Modifier());
    expect(sender.isEmpty).toBe(true);
    logger.log(LogLevel.WARNING, "hello, world", details);
    expect(sender.isEmpty).toBe(false);
    expect(sender.result.context).toHaveProperty(`${TEST_SOURCE}.initial`, "cost");
  });

  test("processors should be able to add new keys", () => {
    logger.processors.push(new Adder());
    expect(sender.isEmpty).toBe(true);
    logger.log(LogLevel.WARNING, "hello, world", details);
    expect(sender.isEmpty).toBe(false);
    expect(sender.result.context).toHaveProperty(`${TEST_SOURCE}.added`, "value");
  });

  test("processors should be able to remove existing keys", () => {
    logger.processors.push(new Remover());
    expect(sender.isEmpty).toBe(true);
    logger.log(LogLevel.WARNING, "hello, world", details);
    expect(sender.isEmpty).toBe(false);
    const actualContext: IContext = sender.result.context;
    expect(actualContext.added).toBeUndefined();
    expect(actualContext.initial).toBeUndefined();
    expect(actualContext[KEY_DETAILS]).toHaveProperty("initial", "initial");
  });

  test("processors should not be able to remove the message_details", () => {
    logger.processors.push(new Purger());
    expect(sender.isEmpty).toBe(true);
    logger.log(LogLevel.WARNING, "hello, world", details);
    expect(sender.isEmpty).toBe(false);
    const actualContext = sender.result.context;
    // Can remove other keys
    expect(actualContext).not.toHaveProperty("added");
    expect(actualContext).not.toHaveProperty("initial");
    // But cannot remove details.
    expect(actualContext).toHaveProperty(KEY_DETAILS, details);
  });

  test("processors should not be able to remove the timestamp or hostname key", () => {
    const serverLogger: ServerLogger = new ServerLogger(newLogStrategy(sender));
    serverLogger.processors.push(new Purger());
    expect(sender.isEmpty).toBe(true);
    const expectedHost = os.hostname();
    const fakeHost = `wrong-${expectedHost}`;
    serverLogger.logExtended(LogLevel.WARNING, "hello, world", {
      // Provide the current hostname in context, it should be overwritten by
      // the logging logic anyway: we know this value not correct.
      [KEY_HOST]: fakeHost,
      ...details,
    });
    const ts = +new Date();
    expect(sender.isEmpty).toBe(false);
    const actualContext = sender.result.context;
    expect(actualContext).toHaveProperty(KEY_HOST, expectedHost);
    expect(actualContext).toHaveProperty(`${KEY_TS}.${serverLogger.side}.log`);
    const lag = ts - actualContext[KEY_TS][serverLogger.side].log;
    expect(lag).toBeGreaterThanOrEqual(0);
    // No sane machine should take more than 100 msec to return from log() with
    // such a fast sending configuration.
    expect(lag).toBeLessThan(100);
  });

  test("processors should neither be able to modify the timestamp, nor the hostname", () => {
    const timeWarp = new TimeWarp();
    logger.processors.push(timeWarp);
    expect(sender.isEmpty).toBe(true);
    const expectedHost = os.hostname();
    const fakeHost = `wrong-${expectedHost}`;
    logger.log(LogLevel.WARNING, "hello, world", { [KEY_HOST]: fakeHost, ...details});
    const ts = +new Date();
    expect(sender.isEmpty).toBe(false);
    const actualContext = sender.result.context;

    // Hostname is a reserved key, so it is not taken from the sourced context.
    // Since this is a Logger, not a ServerLogger, the key is not present.
    expect(actualContext).not.toHaveProperty(KEY_HOST);
    // Instead, it remains in the sourced part of the context.
    const actualSourcedContext: IDetails = actualContext[TEST_SOURCE];
    expect(actualSourcedContext).not.toHaveProperty(KEY_HOST, fakeHost);
    expect(actualSourcedContext).toHaveProperty(KEY_HOST, timeWarp.HOST);

    expect(actualContext).toHaveProperty(`${KEY_TS}.${TEST_SOURCE}.log`);
    const lag = ts - actualContext[KEY_TS][TEST_SOURCE].log;
    expect(lag).toBeGreaterThanOrEqual(0);
    // No sane machine should take more than 100 msec to return from log() with
    // such a fast sending configuration. The TimeWarp processor attempts to
    // set the log timestamp to a much more remote value.
    expect(lag).toBeLessThan(100);
  });
}

export {
  testImmutableContext,
  testMessageContext,
  testObjectifyContext,
  testProcessors,
};
