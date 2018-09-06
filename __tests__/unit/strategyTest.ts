import { NullSender } from "../../src/Senders/NullSender";
import { LeveledStrategy } from "../../src/Strategies/LeveledStrategy";
import {ISender} from "../../src/Senders/ISender";

function testStrategyConstruction() {
  "use strict";

  test("Should accept correct senders", () => {
    const nullSender = new NullSender();
    const leveled = new LeveledStrategy(nullSender, nullSender, nullSender);

    // Constructor returns a LeveledStrategyInstance
    expect(leveled).toBeInstanceOf(LeveledStrategy);

    const actual = leveled.constructor.prototype;
    const expected = LeveledStrategy.prototype;
    // Constructor returns a LeveledStrategyInstance with the proper prototype
    expect(actual).toBe(expected);
  });

  test("Should reject non-senders passed as senders at any position", () => {
    const nullSender = new NullSender();
    expect(() => new LeveledStrategy({} as ISender, nullSender, nullSender)).toThrow();
    expect(() => new LeveledStrategy(nullSender, {} as ISender, nullSender)).toThrow();
    expect(() => new LeveledStrategy(nullSender, nullSender, {} as ISender)).toThrow();
  });
}

export {
  testStrategyConstruction,
};
