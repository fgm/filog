/**
 * @fileOverview Client-side Logger implementation.
 */

import {IStrategy} from "../Strategies/IStrategy";
import { Logger } from "./Logger";

const SIDE = "client";

/**
 * ClientLogger is the client-side implementation of Logger.
 *
 * In its current state, it brings nothing over Logger, simply providing an
 * extension-specialization point.
 */
class ClientLogger extends Logger {

  constructor(strategy: IStrategy) {
    super(strategy);
    this.side = SIDE;
  }

  /**
   * @inheritDoc
   */
  protected getHostname(): string | undefined {
    return undefined;
  }
}

export {
  ClientLogger,
  SIDE as ClientSide,
};
