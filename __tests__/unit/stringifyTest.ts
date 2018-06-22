import ServerLogger from "../../src/ServerLogger";

function testStringifyMessage() {
  const stringify = ServerLogger.stringifyMessage;

  test("should convert strings", () => {
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
      [{ message: "foo" }, "foo"],
      [{ message: 25 }, "25"],
      [{ message: o }, JSON.stringify(value)],
      [{ message: { toString: () => "Hello" } }, "Hello"],
      [{}, "{}"],
      [[], "[]"],
      ["foo", "foo"],
    ];

    for (const expectation of expectations) {
      const doc = expectation[0];
      const expected = expectation[1];
      const actual = stringify(doc);
      // Converting JSON.stringify(doc)).
      expect(actual).toBe(expected);
    }
  });
}

export {
  testStringifyMessage,
};
