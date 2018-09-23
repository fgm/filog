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
 */
const ClientLogger = class extends Logger {};

export default ClientLogger;
