import InvalidArgumentException from "../../src/InvalidArgumentException";
import Logger from "../../src/Logger";
import LL from "../../src/LogLevel";

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

function testLogLevelNames() {
  const expectations = {
    // This should never be invoked, so it is an emergency.
    NaN: LL.EMERGENCY,
    // Levels below minimum are put back into range.
    [LL.EMERGENCY - 1]: LL.EMERGENCY,
    [LL.EMERGENCY]: LL.EMERGENCY,
    [LL.ALERT]: LL.ALERT,
    [LL.CRITICAL]: LL.CRITICAL,
    [LL.ERROR]: LL.ERROR,
    [LL.WARNING]: LL.WARNING,
    // Levels are rounded to closest value, down.
    [LL.WARNING + 0.2]: LL.WARNING,
    // Levels are rounded to closest value, up.
    [LL.WARNING + 0.6]: LL.NOTICE,
    [LL.NOTICE]: LL.NOTICE,
    [LL.INFO]: LL.INFO,
    [LL.INFORMATIONAL]: LL.INFORMATIONAL,
    [LL.DEBUG]: LL.DEBUG,
    // Levels above maximum are pub back into range.
    [LL.DEBUG + 1]: LL.DEBUG,
  };

  for (const [input, expected] of Object.entries(expectations)) {
    const actualName = Logger.levelName(parseFloat(input));
    const actualIndex = LL.Names.indexOf(actualName);
    expect(actualIndex).toBe(expected);
  }
}

export {
  testLogLevels,
  testLogLevelNames,
};
