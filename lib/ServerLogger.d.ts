/// <reference types="node" />
/**
 * @fileOverview Server-side Logger.
 */
import { IncomingMessage, ServerResponse } from "http";
import { WebApp } from "meteor/webapp";
import Logger from "./Logger";
import * as LogLevel from "./LogLevel";
import { IStrategy } from "./Strategies/IStrategy";
import WriteStream = NodeJS.WriteStream;
import { ILogger } from "./ILogger";
import { ISendContext } from "./ISendContext";
declare type OptionalWebApp = typeof WebApp | null;
interface IServerLoggerConstructorParameters {
    enableMethod?: boolean;
    logRequestHeaders?: boolean;
    maxReqListeners?: number;
    servePath?: string;
    verbose?: boolean;
}
/**
 * An extension of the base logger which accepts log input on a HTTP URL.
 *
 * Its main method is log(level, message, context).
 *
 * @see ServerLogger.log
 *
 * @extends Logger
 *
 * @property {string} side
 */
declare class ServerLogger extends Logger implements ILogger {
    webapp: OptionalWebApp;
    /**
     * Return a plain object for all types of context values.
     *
     * @param rawContext
     *   Expect a POJO but accept just about anything.
     *
     * @returns {{}}
     *   - Contexts which are objects are returned as the same key/values, but as
     *     POJOs, even for arrays.
     *   - Scalar contexts are returned as { value: <original value> }
     */
    static objectifyContext(rawContext: any): any;
    /**
     * Return a plain message string from any shape of document.
     *
     * @param doc
     *   Expect it to be an object with a "message" key with a string value, but
     *   accept anything.
     *
     * @returns
     *   A string, as close to the string representation of doc.message as
     *   feasible.
     */
    static stringifyMessage(doc: any): string;
    enableMethod: boolean;
    logRequestHeaders: boolean;
    hostname: string;
    maxReqListeners: number;
    output: WriteStream;
    servePath: string;
    verbose: boolean;
    /**
     * @constructor
     *
     * @param {StrategyBase} strategy
     *   A logging strategy instance.
     * @param {WebApp} webapp
     *   The Meteor WebApp service.
     * @param parameters
     * - enableMethod: enable the filog:log method or not. Defaults to true.
     * - logRequestHeaders: add request headers to the log context. Defaults to true.
     * - maxReqListeners: maximum number of request listeners. Defaults to 11.
     * - servePath: the path on which to expose the logger endpoint. Defaults to "/logger".
     */
    constructor(strategy: IStrategy, webapp?: OptionalWebApp, parameters?: IServerLoggerConstructorParameters);
    /**
     * Build a context object from log() details.
     *
     * @protected
     *
     * @see Logger.log
     *
     * @param details
     *   The message details passed to log().
     * @param source
     *   The source for the event.
     * @param context
     *   Optional: a pre-existing context.
     *
     * @returns
     *   The context with details moved to the message_details subkey.
     */
    buildContext(details: {}, source: string, context?: ISendContext): {};
    /**
     * Handle a log message from the client.
     *
     * @param req
     *   The request.
     * @param res
     *   The response.
     * @param _NEXT
     *   A callback, not used currently.
     *
     * @returns {void}
     */
    handleClientLogRequest(req: IncomingMessage, res: ServerResponse, _NEXT: () => void): void;
    /**
     * @inheritDoc
     */
    log(level: LogLevel.Levels, message: string, rawContext: ISendContext, cooked?: boolean): void;
    /**
     * Extended syntax for log() method.
     *
     * @private
     *
     * @param level
     *   The event level.
     * @param message
     *   The event message.
     * @param details
     *   The details submitted with the message: any additional data added to
     *   the message by the upstream (client/cordova) log() caller().
     * @param context
     *   The context added to the details by upstream processors.
     * @param source
     *   The upstream sender type.
     *
     * @throws InvalidArgumentException
     */
    logExtended(level: LogLevel.Levels, message: string, details: {}, context: ISendContext, source: string): void;
    /**
     * The Meteor server method registered a ${Logger.METHOD}.
     *
     * @param {number} level
     *   The event level.
     * @param {string} message
     *   The event message.
     * @param {Object} context
     *   The event context: any additional data added to the message.
     *
     * @returns {void}
     */
    logMethod({ level, message, context }: {
        level?: number | undefined;
        message?: string | undefined;
        context?: {} | undefined;
    }): void;
    /**
     * Sets up the Connect routing within the Meteor webapp component.
     *
     * @param webapp
     *   The Meteor webapp service (Connect wrapper).
     * @param servePath
     *   The path on which to expose the server logger. Must NOT start by a "/".
     */
    setupConnect(webapp: OptionalWebApp, servePath: string): void;
}
export default ServerLogger;
