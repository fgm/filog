const sinon = require("sinon");

import SyslogSender from "../../src/Senders/SyslogSender";

function testSerializeDeepObject() {
  const LOCAL0 = 16;
  const logLevelWarn = 3;

  const makeSyslog = () => ({
    level: {
      [logLevelWarn]: "warn",
    },
    facility: {
      [LOCAL0]: "local0",
    },
    open: () => {},
    log: () => {},
  });

  const deepContext = () => ({
    level1: {
      level2: {
        level3: {
          level4: {
            level5: {
              level6: "world",
            },
          },
        },
      },
    },
  });

  const circularContext = () => {
    const c = {};
    c.bad = c;
    return c;
  };

  test("syslog should fallback to inspect when serializing circular objects", () => {
    const syslog = makeSyslog();
    const spy = sinon.spy(syslog, "log");
    // test with default options
    const sender1 = new SyslogSender([], "test-sender", {}, LOCAL0, syslog);
    sender1.send(logLevelWarn, "hello", circularContext());
    expect(spy.calledOnce).toBe(true);
    expect(spy.calledWithMatch(logLevelWarn, /Cannot JSON.stringify logged data/)).toBe(true);

    // Notice the non-quoted format used by util.inspect for keys, and single
    // quotes around strings: JSON would have double quotes around both.
    expect(spy.calledWithMatch(logLevelWarn, /\{ message: 'hello'/)).toBe(true);

    expect(spy.calledWithMatch(logLevelWarn, /\[Object\]/)).toBe(false);
  });

  test("syslog should serialize deep object even without configuration", () => {
    const syslog = makeSyslog();
    const spy = sinon.spy(syslog, "log");
    // test with default options
    const sender1 = new SyslogSender([], "test-sender", {}, LOCAL0, syslog);
    sender1.send(logLevelWarn, 'hello', deepContext());
    expect(spy.calledOnce).toBe(true);
    expect(spy.calledWithMatch(logLevelWarn, /world/)).toBe(true);
    expect(spy.calledWithMatch(logLevelWarn, /\[Object\]/)).toBe(false);
  });

  test("syslog should serialize deep object if configured", () => {
    const syslog = makeSyslog();
    const spy = sinon.spy(syslog, "log");
    // test with custom options (depth = 10)
    const sender2 = new SyslogSender([], "test-sender", {}, LOCAL0, syslog, { depth: 10 });
    sender2.send(logLevelWarn, "hello", deepContext());
    expect(spy.calledOnce).toBe(true);
    expect(spy.calledWithMatch(logLevelWarn, /world/)).toBe(true);
    expect(spy.calledWithMatch(logLevelWarn, /\[Object\]/)).toBe(false);
  });
}

export {
  testSerializeDeepObject,
};
