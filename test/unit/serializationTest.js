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

  it('it should fail at serializing deep object', () => {
    const syslog = makeSyslog();
    const spy = sinon.spy(syslog, 'log');
    // test with default options
    const sender1 = new SyslogSender('test-sender', {}, LOCAL0, syslog);
    sender1.send(logLevelWarn, 'hello', deepContext());
    assert.equal(true, spy.calledOnce);
    assert.equal(false, spy.calledWithMatch(logLevelWarn, /world/));
    assert.equal(true, spy.calledWithMatch(logLevelWarn, /\[Object\]/));
  });

  it('it should serialize deep object', () => {
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
