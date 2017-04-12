const sinon = require("sinon");
const chai = require("chai");
const assert = chai.assert;

import SyslogSender from "../../src/Senders/SyslogSender";

function testSerializeDeepObject() {
  const LOCAL0 = 16;
  const logLevelWarn = 3;

  const makeSyslog = () => ({
    level: {
      [logLevelWarn]: 'warn'
    },
    facility: {
      [LOCAL0]: 'local0'
    },
    open: () => {},
    log: () => {}
  });

  const deepContext = () => ({
    level1: {
      level2: {
        level3: {
          level4: {
            level5: {
              level6: 'world'
            }
          }
        }
      }
    }
  });

  const circularContext = () => {
    const c = {}
    c.bad = c;
    return c;
  };

  it('syslog should fallback to inspect when serializing circular objects', () => {
    const syslog = makeSyslog();
    const spy = sinon.spy(syslog, 'log');
    // test with default options
    const sender1 = new SyslogSender('test-sender', {}, LOCAL0, syslog);
    sender1.send(logLevelWarn, 'hello', circularContext());
    assert.equal(true, spy.calledOnce);
    assert.equal(true, spy.calledWithMatch(logLevelWarn, /Cannot JSON.stringify logged data/));

    // Notice the non-quoted format used by util.inspect for keys, and single
    // quotes around strings: JSON would have double quotes around both.
    assert.equal(true, spy.calledWithMatch(logLevelWarn, /\{ message: 'hello'/));

    assert.equal(false, spy.calledWithMatch(logLevelWarn, /\[Object\]/));
  });

  it('syslog should serialize deep object even without configuration', () => {
    const syslog = makeSyslog();
    const spy = sinon.spy(syslog, 'log');
    // test with default options
    const sender1 = new SyslogSender('test-sender', {}, LOCAL0, syslog);
    sender1.send(logLevelWarn, 'hello', deepContext());
    assert.equal(true, spy.calledOnce);
    assert.equal(true, spy.calledWithMatch(logLevelWarn, /world/));
    assert.equal(false, spy.calledWithMatch(logLevelWarn, /\[Object\]/));
  });

  it('syslog should serialize deep object if configured', () => {
    const syslog = makeSyslog();
    const spy = sinon.spy(syslog, 'log');
    // test with custom options (depth = 10)
    const sender2 = new SyslogSender('test-sender', {}, LOCAL0, syslog, { depth: 10 });
    sender2.send(logLevelWarn, 'hello', deepContext());
    assert.equal(true, spy.calledOnce);
    assert.equal(true, spy.calledWithMatch(logLevelWarn, /world/));
    assert.equal(false, spy.calledWithMatch(logLevelWarn, /\[Object\]/));
  });
}

export {
  testSerializeDeepObject
};
