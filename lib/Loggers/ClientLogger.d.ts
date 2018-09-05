/**
 * @fileOverview Client-side Logger implementation.
 */
import { IStrategy } from "../Strategies/IStrategy";
import { Logger } from "./Logger";
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
    /**
     * @inheritDoc
     */
    protected getHostname(): string | undefined;
}
export { ClientLogger, };
