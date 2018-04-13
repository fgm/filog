import InvalidArgumentException from "../../src/InvalidArgumentException";
import Logger from "../../src/Logger";

function testLogLevels() {
  const strategy = {
    customizeLogger: () => [],
  };
  test("log() should throw on non-integer levels", () => {
    const logger = new Logger(strategy);
    expect(() => {
      logger.log(4.2, "Not an integer", {});
    }).toThrowError(InvalidArgumentException);
    expect(() => {
      logger.log("5", "Not an integer", {});
    }).toThrowError(InvalidArgumentException);
    expect(() => {
      logger.log({}, "Not an integer", {});
    }).toThrowError(InvalidArgumentException);
  });
  test("log() should throw on integer levels out of range", () => {
    const logger = new Logger(strategy);
    expect(() => {
      logger.log(-1, "Not an integer", {});
    }).toThrowError(InvalidArgumentException);
    expect(() => {
      logger.log(8, "Not an integer", {});
    }).toThrowError(InvalidArgumentException);
  });
}

export {
  testLogLevels
};
