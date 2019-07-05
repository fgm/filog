/**
 * @fileOverview Client-side Logger implementation.
 */
import { IStrategy } from "../Strategies/IStrategy";
import { Logger } from "./Logger";
declare const SIDE = "client";
/**
 * ClientLogger is the client-side implementation of Logger.
 *
 * In its current state, it brings nothing over Logger, simply providing an
 * extension-specialization point.
 */
declare class ClientLogger extends Logger {
    constructor(strategy: IStrategy);
    /**
     * @inheritDoc
     */
    protected getHostname(): string | undefined;
}
export { ClientLogger, SIDE as ClientSide, };
