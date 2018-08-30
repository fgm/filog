import LogLevel from "../../src/LogLevel";
import Logger from "../../src/Logger";
import ServerLogger from "../../src/ServerLogger";
import ProcessorBase from "../../src/Processors/ProcessorBase";

function testImmutableContext() {
  const strategy = {
    customizeLogger: () => [],
    selectSenders: () => [],
  };
  test("should not modify context in log() calls", () => {
    const logger = new Logger(strategy);
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
  let result;
  const referenceContext = { a: "A" };
  const sender = new class {
    send(level, message, context) {
      result = { level, message, context };
    }
  }();

  const strategy = {
    customizeLogger: () => [],
    selectSenders: () => [sender],
  };

  const DETAILS_KEY = "message_details";

  test(`should add the message argument to ${DETAILS_KEY}`, () => {
    const logger = new Logger(strategy);
    result = null;
    logger.log(LogLevel.DEBUG, "some message", referenceContext);

    const actual = result.context[DETAILS_KEY].a;
    const expected = "A";
    // Message details is set
    expect(actual).toBe(expected);
  });

  test(`should merge contents of existing ${DETAILS_KEY} context key`, () => {
    const logger = new Logger(strategy);
    result = null;
    const originalContext = Object.assign({ [DETAILS_KEY]: { foo: "bar" } }, referenceContext);
    logger.log(LogLevel.DEBUG, "some message", originalContext);

    const actual = result.context[DETAILS_KEY];

    // Original top-level key should be in top [DETAILS_KEY].
    const expectedReference = "A";
    expect(actual).toHaveProperty("a");
    expect(actual.a).toBe(expectedReference);

    // Key nested in original message_detail should also in top [DETAILS_KEY].
    const expectedNested = "bar";
    expect(actual).toHaveProperty("foo");
    expect(actual.foo).toBe(expectedNested);
  });

  test(`should not merge existing ${DETAILS_KEY} context key itself`, () => {
    const logger = new Logger(strategy);
    result = null;
    const originalContext = Object.assign({ [DETAILS_KEY]: { foo: "bar" } }, referenceContext);
    logger.log(LogLevel.DEBUG, "some message", originalContext);

    // Message+_details should not contain a nested [DETAILS_KEY].
    const actual = result.context[DETAILS_KEY];
    expect(actual).not.toHaveProperty(DETAILS_KEY);
  });

  test(`should keep the latest keys when merging existing ${DETAILS_KEY}`, () => {
    const logger = new Logger(strategy);
    result = null;
    const originalContext = Object.assign(referenceContext, { [DETAILS_KEY]: { a: "B" } });
    logger.log(LogLevel.DEBUG, "some message", originalContext);

    // [DETAILS_KEY] should contain the newly added value for key "a", not the
    // one present in the initial [DETAILS_KEY].
    const actual = result.context[DETAILS_KEY];
    const expected = "A";
    // Message details is set
    expect(actual).toHaveProperty("a");
    expect(actual.a).toBe(expected);
  });

  test("should not add the message arguments to context root", () => {
    const logger = new Logger(strategy);
    result = null;
    logger.log(LogLevel.DEBUG, "some message", referenceContext);

    const actual = result.context.hasOwnProperty("a");
    const expected = false;
    // Message details is set
    expect(actual).toBe(expected);
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

    scalars.forEach(v => {
      const objectified = objectifyContext(v);
      // const printable = JSON.stringify(objectified);

      let actual = typeof objectified;
      let expected = "object";
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
    const expected = raw;
    expect(actual).toBe(expected);
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

  test("should downgrade boxing classes to underlying primitives", () => {
    const expectations = [
      // Primitive, boxed.
      [true, new Boolean(true)],
      [1E15, new Number(1E15)],
      ["😂 hello, α world", new String("😂 hello, α world")],
    ];

    for (const [primitive, boxed] of expectations) {
      expect(typeof boxed).toBe("object");
      const actual = objectifyContext(boxed);
      expect(actual).toBe(primitive);
    }
  });

  test("should downgrade miscellaneous classed objects to POJOs", () => {
    const value = "foo";
    class Foo {
      constructor(v) {
        this.k = v;
      }
    }
    const initial = new Foo(value);

    let actual = typeof initial;
    let expected = "object";
    expect(actual).toBe(expected);

    actual = initial.constructor.name;
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
  class Sender {
    constructor() {
      this.logs = [];
    }

    send(level, message, context) {
      this.logs.push([level, message, context]);
    }
  }

  class Adder extends ProcessorBase {
    process(context) {
      const result = Object.assign({ added: "value" }, context);
      return result;
    }
  }

  class Modifier extends ProcessorBase {
    process(context) {
      context.initial = "cost";
      return context;
    }
  }

  class Remover extends ProcessorBase {
    process(context) {
      const { added, initial, ...rest } = context;
      return rest;
    }
  }

  /**
   * Class Purger attempts to remove all known properties from the context.
   *
   * Look at the timestamp test.
   */
  class Purger extends ProcessorBase {
    process(context) {
      return {};
    }
  }

  class TimeWarp extends ProcessorBase {
    // Let's do the time warp again.
    process(context) {
      context.timestamp = { log: +new Date("1978-11-19 05:00:00") };
      context.hostname = "remote";
      return context;
    }
  }

  beforeEach(() => {
    this.initialContext = { initial: "initial" };
    this.sender = new Sender();
    this.strategy = {
      customizeLogger: () => [],
      selectSenders: () => [this.sender],
    };
    this.logger = new Logger(this.strategy);
  });

  test("processors should be able to modify the content of ordinary existing keys", () => {
    this.logger.processors.push(new Modifier());
    expect(this.sender.logs.length).toBe(0);
    this.logger.log(LogLevel.WARNING, "hello, world", this.initialContext);
    expect(this.sender.logs.length).toBe(1);
    const [,, context] = this.sender.logs.pop();
    expect(context).toHaveProperty("initial", "cost");
  });

  test("processors should be able to add new keys", () => {
    this.logger.processors.push(new Adder());
    expect(this.sender.logs.length).toBe(0);
    this.logger.log(LogLevel.WARNING, "hello, world", this.initialContext);
    expect(this.sender.logs.length).toBe(1);
    const [,, context] = this.sender.logs.pop();
    expect(context).toHaveProperty("added", "value");
  });

  test("processors should be able to remove existing keys", () => {
    this.logger.processors.push(new Remover());
    expect(this.sender.logs.length).toBe(0);
    this.logger.log(LogLevel.WARNING, "hello, world", this.initialContext);
    expect(this.sender.logs.length).toBe(1);
    const [,, context] = this.sender.logs.pop();
    expect(context.added).toBeUndefined();
    expect(context.initial).toBeUndefined();
    // By default, pre-processing content goes to the message_details key.
    expect(context.message_details).toHaveProperty("initial", "initial");
  });

  test("processors should be able to remove the message_details", () => {
    this.logger.processors.push(new Purger());
    expect(this.sender.logs.length).toBe(0);
    this.logger.log(LogLevel.WARNING, "hello, world", this.initialContext);
    expect(this.sender.logs.length).toBe(1);
    const [,, context] = this.sender.logs.pop();
    expect(context).not.toHaveProperty("added");
    expect(context).not.toHaveProperty("initial");
    expect(context).not.toHaveProperty("message_details");
  });

  test("processors should not be able to remove the timestamp or hostname key", () => {
    this.logger.processors.push(new Purger());
    expect(this.sender.logs.length).toBe(0);
    this.logger.log(LogLevel.WARNING, "hello, world", { hostname: "local", ...this.initialContext });
    const ts = +new Date();
    expect(this.sender.logs.length).toBe(1);
    const [,, context] = this.sender.logs.pop();
    expect(context).toHaveProperty("hostname", "local");
    expect(context).toHaveProperty("timestamp.log");
    const lag = ts - context.timestamp.log;
    expect(lag).toBeGreaterThanOrEqual(0);
    // No sane machine should take more than 100 msec to return from log() with
    // such a fast sending configuration.
    expect(lag).toBeLessThan(100);
  });

  test("processors should not be able to modify the timestamp, but be able to modify the hostname", () => {
    this.logger.processors.push(new TimeWarp());
    expect(this.sender.logs.length).toBe(0);
    this.logger.log(LogLevel.WARNING, "hello, world", this.initialContext);
    const ts = +new Date();
    expect(this.sender.logs.length).toBe(1);
    const [,, context] = this.sender.logs.pop();
    expect(context).toHaveProperty("hostname", "remote");
    expect(context).toHaveProperty("timestamp.log");
    const lag = ts - context.timestamp.log;
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
