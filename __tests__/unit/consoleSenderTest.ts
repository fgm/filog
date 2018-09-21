/**
 * @fileOverview Test file for ConsoleSender.
 */

/** global: console */

import NullFn from "../../src/NullFn";
import { ConsoleSender } from "../../src/Senders/ConsoleSender";
import { ISender } from "../../src/Senders/ISender";

let savedConsole: any;

function testConsoleSender() {
  beforeEach(() => {
    savedConsole = console;
  });

  afterEach(() => {
    console = savedConsole;
  });

  test("constructor accepts well-formed console object", () => {
    const sender = new ConsoleSender();
    expect(sender).toBeInstanceOf(ConsoleSender);
  });

  test("constructor validates console object", () => {
    const invalid = [
      null,
      true,
      62,
      "a",
      [],
      {},
      { log: NullFn, info: NullFn, warn: NullFn },
      { log: NullFn, info: NullFn, warn: NullFn, error: false },
    ];

    invalid.forEach((c) => {
      // We explicitly pass data with invalid type to test runtime checks.
      (console as any) = c /* as Console */;
      let sender: ISender | null = null;
      expect(() => {
        sender = new ConsoleSender();
      }).toThrow();
      expect(sender).toBe(null);
    });

  });
}

export {
  testConsoleSender,
};
