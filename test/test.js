import 'babel-polyfill';

import ServerLogger from '../src/ServerLogger';

var assert = require('chai').assert;

describe('ServerLogger', function () {
  "use strict";
  describe('objectifyContext()', function () {
    const objectifyContext = ServerLogger.objectifyContext;

    it('should convert arrays to POJOs', () => {
      var a = ['a', 'b'];
      var o = objectifyContext(a);
      assert.equal(typeof o, 'object');
      assert.equal(o.constructor.name, 'Object');
    });

    it('should convert scalars to POJOs with a value key', () => {
      const scalars = [
        'Hello, world', '',
        42, +0, -0, 0, NaN, -Infinity, +Infinity,
        null,
        true, false,
        undefined
      ];

      scalars.forEach(v => {
        const actual = objectifyContext(v);
        const printable = JSON.stringify(actual);
        assert.equal(typeof actual, 'object', "Result type is 'object' for " + printable);
        assert.equal(actual.constructor.name, 'Object', "Result constructor is 'Object' for " + printable);
        const actualKeys = Object.keys(actual);
        assert.equal(actualKeys.length, 1, 'Result has a single key for ' + printable);
        assert.equal(actualKeys[0], 'value', "Result key is called 'value' for " + printable);
        assert.isTrue(Object.is(actual.value, v), 'Result value is the original value for ' + printable);
      });
    });

    it('should not modify existing POJOs', () => {
      var raw = { a: 'b' };
      const actual = objectifyContext(raw);
      assert.strictEqual(actual, raw);
    });

    it('should convert date objects to ISO date strings', () => {
      const d = new Date(Date.UTC(2016, 5, 24, 16, 0, 30, 250));
      const actual = objectifyContext(d);
      assert.equal(typeof actual, 'string', 'Result for date object is a string');
      assert.equal(actual, d.toISOString(), '2016-05-24T16:00:30.250Z', 'Result is the ISO representation of the date');
    });

    // TODO also check wrapper objects with no keys like new Number(25), new Boolean(true).
    it('should downgrade miscellaneous classed objects to POJOs', () => {
      const value = 'foo';
      class Foo {
        constructor(v) {
          this.k = v;
        }
      }
      const initial = new Foo(value);
      assert.equal(typeof initial, 'object');
      assert.equal(initial.constructor.name, 'Foo');

      const actual = objectifyContext(initial);
      assert.equal(JSON.stringify(Object.keys(actual)), JSON.stringify(['k']), 'Result has same properties as initial object');
      assert.equal(actual.k, value, 'Result has same values as initial object');
      assert.equal(typeof actual, 'object', 'Result is an object');
      assert.equal(actual.constructor.name, 'Object', "Result constructor is 'Object'");
      assert.notStrictEqual(actual, initial, 'Result is not the initial object itself');
      assert.notEqual(actual, initial, 'Result is not even equal to the initial object');
    });
  });

  describe('stringifyMessage', () => {
    const stringify = ServerLogger.stringifyMessage;

    it("should convert strings", () => {
      const value = "foo";

      class Printable {
        constructor(v) {
          this.k = v;
        }

        toString() {
          return JSON.stringify(this.k);
        }
      }

      const o = new Printable(value);

      const expectations = [
        [{ message: 'foo' }, 'foo'],
        [{ message: 25 }, '25'],
        [{ message: o }, JSON.stringify(value)],
        [{}, '{}'],
        [[], '[]'],
        ['foo', "'foo'"]
      ];

      for (const expectation of expectations) {
        const doc = expectation[0];
        const expected = expectation[1];
        const actual = stringify(doc);
        assert.strictEqual(actual, expected, 'Converting ' + JSON.stringify(doc));
      }
    });
  });
});
