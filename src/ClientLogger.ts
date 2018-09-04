/**
 * @fileOverview Client-side Logger implementation.
 */

import Logger from "./Logger";
import {IStrategy} from "./Strategies/IStrategy";

const SIDE = "client";

/**
 * ClientLogger is the client-side implementation of Logger.
 *
 * In its current state, it brings nothing over Logger, simply providing an
 * extension-specialization point.
 *
 * @extends Logger
 *
 * @property {string} side
 */
class ClientLogger extends Logger {
  public static readonly side = SIDE;

  constructor(strategy: IStrategy) {
    super(strategy);
    this.side = SIDE;
  }
}

export default ClientLogger;
