import ServerLogger from "../../src/ServerLogger";

const chai = require("chai");
const assert = chai.assert;

function testStringifyMessage() {
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
      [{message: "foo"}, "foo"],
      [{message: 25}, "25"],
      [{message: o}, JSON.stringify(value)],
      [{}, "{}"],
      [[], "[]"],
      ["foo", "foo"]
    ];

    for (const expectation of expectations) {
      const doc = expectation[0];
      const expected = expectation[1];
      const actual = stringify(doc);
      assert.strictEqual(actual, expected, "Converting " + JSON.stringify(doc));
    }
  });
}

export {
  testStringifyMessage
};
