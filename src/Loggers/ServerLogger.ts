/**
 * @fileOverview Server-side Logger.
 */

// Node.JS packages: this is server-side code.
import * as os from "os";
import process from "process";
import * as util from "util";

// Meteor imports.
import * as connect from "connect";
import { IncomingMessage, ServerResponse } from "http";
import { WebApp } from "meteor/webapp";

// Package imports.
import {
  IContext,
  KEY_DETAILS,
  KEY_SOURCE,
} from "../IContext";
import * as LogLevel from "../LogLevel";
import {IStrategy} from "../Strategies/IStrategy";
import {ClientSide} from "./ClientLogger";
import {ILogger} from "./ILogger";
import {Logger} from "./Logger";
import WriteStream = NodeJS.WriteStream;

interface IWebApp {
  connectHandlers: connect.Server;
}
type OptionalWebApp = typeof WebApp | IWebApp | null;

interface IServerLoggerConstructorParameters {
  enableMethod?: boolean;
  logRequestHeaders?: boolean;
  maxReqListeners?: number;
  servePath?: string;
  verbose?: boolean;
}

const SIDE = "server";

/**
 * An extension of the base logger which accepts log input on a HTTP URL.
 *
 * Its main method is log(level, message, context).
 *
 * @see ServerLogger.log
 */
class ServerLogger extends Logger implements ILogger {

  /**
   * Return a plain object for all types of context values.
   *
   * @param rawContext
   *   Expect a POJO but accept just about anything.
   *   Expect a POJO but accept just about anything.
   *
   * @returns {{}}
   *   - Contexts which are objects are returned as the same key/values, but as
   *     POJOs, even for arrays.
   *   - Scalar contexts are returned as { value: <original value> }
   */
  public static objectifyContext(rawContext: any) {
    let context;
    if (typeof rawContext === "object") {
      // JS null is an object: handle it like a scalar.
      if (rawContext === null) {
        context = { value: null };
      } else {
        const className = rawContext.constructor.name;
        switch (className) {
          case "Date":
            context = rawContext.toISOString();
            break;

          // Boxing wrappers need to be converted to the primitive value.
          case "Boolean":
          case "Number":
          case "String":
            context = rawContext.valueOf();
            break;

          // POJOs can be used as such.
          case "Object":
            context = rawContext;
            break;

          // Arrays and classed objects need to be downgraded to POJOs.
          default:
            context = Object.assign({}, rawContext);
            break;
        }
      }
    } else {
      // Other data types are scalars, so we need to wrap them in an object.
      context = { value: rawContext };
    }
    return context;
  }

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
  public static stringifyMessage(doc: any): string {
    if (typeof doc === "string") {
      return doc;
    }

    const rawMessage = doc.message;

    if (rawMessage) {
      if (typeof rawMessage === "string") {
        return rawMessage;
      } else if (typeof rawMessage.toString === "function") {
        return rawMessage.toString();
      }
    }

    return util.inspect(doc);
  }

  public enableMethod: boolean = true;
  public logRequestHeaders: boolean = true;
  public hostname: string;
  public maxReqListeners: number = 11;
  public output: WriteStream;
  public servePath: string = "/logger";
  // Should usually not be modified.
  public side = "server";
  public verbose: boolean = false;

  // noinspection JSClassNamingConvention
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
  constructor(
    strategy: IStrategy,
    public webapp: OptionalWebApp = null,
    parameters: IServerLoggerConstructorParameters = {},
  ) {
    super(strategy);
    this.output = process.stdout;
    this.side = SIDE;
    const defaultParameters: IServerLoggerConstructorParameters = {
      enableMethod: true,
      logRequestHeaders: true,
      // Preserve the legacy Filog default, but allow configuration.
      maxReqListeners: 11,
      servePath: "/logger",
      verbose: false,
    };

    // Loop on defaults, not arguments, to avoid injecting any random junk.
    for (const key in defaultParameters) {
      if (defaultParameters.hasOwnProperty(key)) {
        const k = key as keyof IServerLoggerConstructorParameters;
        const value = (typeof parameters[k] !== "undefined")
          ? parameters[k]
          : defaultParameters[k];
        // We took care NOT to have undefined, so tell it to the compiler.
        this[k] = value!;
      }
    }

    this.hostname = os.hostname();

    if (this.enableMethod) {
      Meteor.methods({ [Logger.METHOD]: this.logMethod.bind(this) });
    }

    this.setupConnect(webapp, this.servePath);
  }

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
  public handleClientLogRequest(req: IncomingMessage, res: ServerResponse, _NEXT: () => void) {
    const method = (req.method || "GET").toUpperCase();
    if (method !== "POST") {
      // RFC2616: 405 means Method not allowed.
      res.writeHead(405);
      res.end();
      return;
    }

    // Early filog versions needed at least 11, while Node.JS is 10.
    // This appears to no longer be needed, but ensure it can be configured.
    req.setMaxListeners(this.maxReqListeners);

    let body = "";
    req.setEncoding("utf-8");

    req.on("data", (chunk: string) => { body += chunk; });

    req.on("end", Meteor.bindEnvironment(
      () => {
        let result;
        try {
          const doc = JSON.parse(body);
          // RFC 5424 Table 2: 7 == debug.
          const level = (typeof doc.level !== "undefined") ? parseInt(doc.level, 10) : 7;
          const message = ServerLogger.stringifyMessage(doc);
          if (typeof doc.context === "undefined") {
            doc.context = {};
          }
          const context = ServerLogger.objectifyContext(doc.context);
          if (this.logRequestHeaders) {
            context.requestHeaders = req.headers;
          }
          const {
            [KEY_DETAILS]: details,
            // tslint:disable-next-line
            ...nonDetails
          } = context;
          this.logExtended(level, message, nonDetails, ClientSide);
          res.statusCode = 200;
          result = "";
        } catch (err) {
          res.statusCode = 422;
          result = `Could not parse JSON message: ${err.message}.`;
        }
        res.end(result);
      },
      // Meteor.d.ts misses the optional second argument.
      // console.log
    ));
  }

  /**
   * Extended syntax for log() method.
   *
   * @private
   *
   * @param level
   *   The event level.
   * @param message
   *   The event message.
   * @param context
   *   The context added to the details by upstream processors.
   * @param source
   *   The upstream sender type.
   *
   * @throws InvalidArgumentException
   */
  public logExtended(
    level: LogLevel.Levels,
    message: object|string,
    context: IContext,
    source: string): void {
    Logger.validateLevel(level);

    const c1: IContext = {
      ...context,
      [KEY_SOURCE]: source,
    };

    const c2 = this.defaultContext(c1);
    const preservedTop = this.getReservedContext(c2);
    const initialKeys = Object.keys(c2);
    const c3 = this.process(c2);
    const c4 = this.source(c3, preservedTop, initialKeys);

    this.send(this.strategy, level, String(message), c4);
  }

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
  public logMethod({ level = LogLevel.INFO, message = "", context = {} }) {
    this.logExtended(level, message, context, ClientSide);
  }

  /**
   * Sets up the Connect routing within the Meteor webapp component.
   *
   * @param webapp
   *   The Meteor webapp service (Connect wrapper).
   * @param servePath
   *   The path on which to expose the server logger. Must NOT start by a "/".
   */
  public setupConnect(webapp: OptionalWebApp, servePath: string): void {
    this.webapp = webapp;
    if (this.webapp) {
      if (this.verbose) {
        this.output.write(`Serving logger on ${servePath}.\n`);
      }
      const app = this.webapp.connectHandlers;
      app.use(this.servePath, this.handleClientLogRequest.bind(this));
    } else {
      if (this.verbose) {
        this.output.write(`Not serving logger, path ${servePath}.\n`);
      }
    }
  }

  /**
   * @inheritDoc
   */
  protected _getHostname(): string | undefined {
    if (!this.hostname) {
      this.hostname = os.hostname();
    }

    return this.hostname;
  }
}

export {
  IServerLoggerConstructorParameters,
  ServerLogger,
  SIDE as ServerSide,
};
