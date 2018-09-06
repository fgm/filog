import {IContext} from "../../src/IContext";
import * as LogLevel from "../../src/LogLevel";
import {ISender} from "../../src/Senders/ISender";
import {IStrategy} from "../../src/Strategies/IStrategy";

type StrategyFactory = (sender?: ISender) => IStrategy;

const newEmptyStrategy: StrategyFactory = () => ({
  customizeLogger: () => [],
  selectSenders: () => [],
});

/**
 * This extension is only for tests checking <instance>.constructor.name.
 *
 * In normal code, the constructor name may be mangled or unavailable after
 * minification, so no userland code should use it. But since test code is not
 * minimized, it is still useful in that case.
 *
 * @internal
 */
interface IConstructor extends Function {
  name: string;
}

interface IResult {
  level?: LogLevel.Levels;
  message?: string;
  context?: IContext;
}

/**
 * A Sender class storing results internally, for review by tests.
 */
class TestSender implements ISender {
  public result: IResult = {};

  public send(level, message, context): void {
    this.result = { level, message, context };
  }
}

const newLogStrategy: StrategyFactory = (sender: TestSender) => ({
  ...newEmptyStrategy(),
  selectSenders: () => [sender],
});

export {
  IConstructor,
  IResult,
  StrategyFactory,
  newEmptyStrategy,
  newLogStrategy,
  TestSender,
};
