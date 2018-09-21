/**
 * @fileOverview NulllSender class.
 */

import {IContext} from "../IContext";
import * as LogLevel from "../LogLevel";
import {ISender} from "./ISender";

/**
 * NullSender defines an explicit null sender.
 */
class NullSender implements ISender {
  /** @inheritDoc */
  public send(_1: LogLevel.Levels, _2: string, _3: IContext): void {
    // Explicit return is needed to avoid the TSlint no-empty warning.
    return;
  }
}

export {
  NullSender,
};
