import LeveledStrategy from "../../src/Strategies/LeveledStrategy";
import NullSender from "../../src/Senders/NullSender";

function testStrategyConstruction() {
  "use strict";

  test("Should accept correct senders", () => {
    const nullSender = new NullSender();
    const leveled = new LeveledStrategy(nullSender, nullSender, nullSender);

    let actual = leveled.constructor.name;
    let expected = "LeveledStrategy";
    // Constructor returns a LeveledStrategyInstance
    expect(actual).toBe(expected);

    actual = leveled.constructor.prototype;
    expected = LeveledStrategy.prototype;
    // Constructor returns a LeveledStrategyInstance with the proper prototype
    expect(actual).toBe(expected);
  });

  test("Should reject non-senders passed as senders at any position", () => {
    const nullSender = new NullSender();
    expect(() => new LeveledStrategy({}, nullSender, nullSender)).toThrow();
    expect(() => new LeveledStrategy(nullSender, {}, nullSender)).toThrow();
    expect(() => new LeveledStrategy(nullSender, nullSender, {}).toThrow());
  });
}

export {
  testStrategyConstruction,
};
