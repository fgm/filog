/**
 * @fileOverview Client-side Logger implementation.
 */

import Logger from "./Logger";

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
const ClientLogger = class extends Logger {
  constructor(strategy) {
    super(strategy);
    this.side = SIDE;
  }
};

ClientLogger.side = SIDE;

export default ClientLogger;
