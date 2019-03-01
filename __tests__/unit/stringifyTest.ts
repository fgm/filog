import { Logger } from "../../src/Loggers/Logger";

function testStringifyMessage() {
  const stringify = Logger.stringifyMessage;

  test("should convert to strings", () => {
    const value = "foo";

    class Printable {
      public k: any;

      constructor(v: any) {
        this.k = v;
      }

      public toString() {
        return JSON.stringify(this.k);
      }
    }

    const o = new Printable(value);

    const expectations = [
      // Handle special "message" key in objects.
      [{ message: "foo" }, "foo"],
      [{ message: 25 }, "25"],
      [{ message: "foo", a: "A" }, 'foo'],
      // Do not specialize other keys.
      [{ messages: "foo", a: "A" }, "{ messages: 'foo', a: 'A' }"],
      // Apply toString().
      [{ message: o }, JSON.stringify(value)],
      [{ message: { toString: () => "Hello" } }, "Hello"],
      // Default formatting.
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
