/**
 * @fileOverview Client-side Logger implementation.
 */
import Logger from "./Logger";
import { IStrategy } from "./Strategies/IStrategy";
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
declare class ClientLogger extends Logger {
    static readonly side: string;
    constructor(strategy: IStrategy);
}
export default ClientLogger;
