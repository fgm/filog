const chai = require("chai");
const assert = chai.assert;

import LeveledStrategy from "../../src/Strategies/LeveledStrategy";
import NullSender from "../../src/Senders/NullSender";

function testStrategyConstruction() {
  "use strict";

  it("Should accept correct senders", function () {
    const nullSender = new NullSender();
    const leveled = new LeveledStrategy(nullSender, nullSender, nullSender);
    assert(leveled.constructor.name === 'LeveledStrategy', "Constructor returns a LeveledStrategyInstance");
    assert(leveled.constructor.prototype === LeveledStrategy.prototype, "Constructor returns a LeveledStrategyInstance with the proper prototype");
  });

  it("Should reject non-senders passed as senders at any position", function () {
    const nullSender = new NullSender();
    assert.throws(() => {
      //noinspection Eslint
      new LeveledStrategy({}, nullSender, nullSender);
    });
    assert.throws(() => {
      //noinspection Eslint
      new LeveledStrategy(nullSender, {}, nullSender);
    });
    assert.throws(() => {
      //noinspection Eslint
      new LeveledStrategy(nullSender, nullSender, {});
    });
  });
}

export {
  testStrategyConstruction
};
