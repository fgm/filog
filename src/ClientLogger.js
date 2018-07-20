/**
 * @fileOverview Client-side Logger implementation.
 */

import Logger from "./Logger";

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
    this.side = ClientLogger.side;
  }
};

ClientLogger.side = 'client';

export default ClientLogger;
