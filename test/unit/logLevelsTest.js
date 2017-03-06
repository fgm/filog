const chai = require("chai");
const assert = chai.assert;

import InvalidArgumentException from "../../src/InvalidArgumentException";
import Logger from "../../src/Logger";

function testLogLevels() {
  "use strict";
  const strategy = {
    customizeLogger: () => [],
    selectSenders: () => []
  };
  it("log() should throw on non-integer levels", function () {
    const logger = new Logger(strategy);
    assert.throws(() => {
      //noinspection Eslint
      logger.log(4.2, "Not an integer", {});
    }, InvalidArgumentException);
    assert.throws(() => {
      //noinspection Eslint
      logger.log("5", "Not an integer", {});
    }, InvalidArgumentException);
    assert.throws(() => {
      //noinspection Eslint
      logger.log({}, "Not an integer", {});
    }, InvalidArgumentException);
  });
  it ("log() should throw on integer levels out of range", function () {
    const logger = new Logger(strategy);
    assert.throws(() => {
      //noinspection Eslint
      logger.log(-1, "Not an integer", {});
    }, InvalidArgumentException);
    assert.throws(() => {
      //noinspection Eslint
      logger.log(8, "Not an integer", {});
    }, InvalidArgumentException);
  });
}

export {
  testLogLevels
};
