import { SyslogSender } from "../../src/Senders/SyslogSender";

function testSerializeDeepObject() {
  const LOCAL0 = 16;
  const logLevelWarn = 3;

  const makeSyslog = () => ({
    facility: {
      [LOCAL0]: "local0",
    },
    level: {
      [logLevelWarn]: "warn",
    },
    log: () => undefined,
    open: () => undefined,
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
    const c: any = {};
    c.bad = c;
    return c;
  };

  test("syslog should fallback to inspect when serializing circular objects", () => {
    const syslog = makeSyslog();
    const spy = jest.spyOn(syslog, "log");
    // test with default options
    const sender1 = new SyslogSender("test-sender", 0, LOCAL0, syslog);
    sender1.send(logLevelWarn, "hello", circularContext());
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(logLevelWarn, expect.stringMatching(/Cannot JSON.stringify logged data/));

    // Notice the non-quoted format used by util.inspect for keys, and single
    // quotes around strings: JSON would have double quotes around both.
    expect(spy).toHaveBeenCalledWith(logLevelWarn, expect.stringMatching(/message: 'hello'/));

    expect(spy).not.toHaveBeenCalledWith(logLevelWarn, expect.stringMatching(/\[Object\]/));
  });

  test("syslog should serialize deep object even without configuration", () => {
    const syslog = makeSyslog();
    const spy = jest.spyOn(syslog, "log");
    // test with default options
    const sender1 = new SyslogSender("test-sender", 0, LOCAL0, syslog);
    sender1.send(logLevelWarn, "hello", deepContext());
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(logLevelWarn, expect.stringMatching(/world/));
    expect(spy).not.toHaveBeenCalledWith(logLevelWarn, expect.stringMatching(/\[Object\]/));
  });

  test("syslog should serialize deep object if configured", () => {
    const syslog = makeSyslog();
    const spy = jest.spyOn(syslog, "log");
    // test with custom options (depth = 10)
    const options: {} = { depth: 10 };
    const sender2 = new SyslogSender("test-sender", 0, LOCAL0, syslog, options);
    sender2.send(logLevelWarn, "hello", deepContext());
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(logLevelWarn, expect.stringMatching(/world/));
    expect(spy).not.toHaveBeenCalledWith(logLevelWarn, expect.stringMatching(/\[Object\]/));
  });
}

export {
  testSerializeDeepObject,
};
