import {IContext} from "../../src/IContext";
import * as LogLevel from "../../src/LogLevel";
import {ISender} from "../../src/Senders/ISender";
import {IStrategy} from "../../src/Strategies/IStrategy";

type StrategyFactory = (sender?: ISender) => IStrategy;

const newEmptyStrategy: StrategyFactory = () => ({
  customizeLogger: () => [],
  selectSenders: () => [],
});

interface IResult {
  level?: LogLevel.Levels;
  message?: string;
  context?: IContext;
}

class TestSender {
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
  IResult,
  StrategyFactory,
  newEmptyStrategy,
  newLogStrategy,
  TestSender,
};
