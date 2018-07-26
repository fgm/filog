/**
 * @fileOverview Server-side Logger.
 */
import ClientLogger from "./ClientLogger";
import Logger from "./Logger";
import * as util from "util";
import { hostname } from "os";
import LogLevel from "./LogLevel";
import process from "process";

const SIDE = "server";

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
class ServerLogger extends Logger {
  // noinspection JSClassNamingConvention
  /**
   * @constructor
   *
   * @param {StrategyBase} strategy
   *   A logging strategy instance.
   * @param {WebApp} webapp
   *   The Meteor WebApp service.
   * @param {Object} parameters
   * - enableMethod: enable the filog:log method or not. Defaults to true.
   * = maxReqListeners: Node JS legacy parameter. Defaults to 11.
   * - logRequestHeaders: add request headers to the log context. Defaults to true.
   * - servePath: the path on which to expose the logger endpoint. Defaults to "/logger".
   * - verbose. Defaults to false.
   */
  constructor(strategy, webapp = null, parameters = {}) {
    super(strategy);
    this.output = process.stdout;
    this.side = SIDE;
    const defaultParameters = {
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
        this[key] = (typeof parameters[key] !== "undefined")
          ? parameters[key]
          : defaultParameters[key];
      }
    }

    this.hostname = hostname();

    if (this.enableMethod) {
      Meteor.methods({ [Logger.METHOD]: this.logMethod.bind(this) });
    }

    this.setupConnect(webapp, this.servePath);
  }

  /**
   * Build a context object from log() details.
   *
   * @protected
   *
   * @see Logger.log
   *
   * @param {Object} details
   *   The message details passed to log().
   * @param {string} source
   *   The source for the event.
   * @param {Object} context
   *   Optional: a pre-existing context.
   *
   * @returns {Object}
   *   The context with details moved to the message_details subkey.
   */
  buildContext(details, source, context = {}) {
    // Ignore source and host keys from caller context.
    const {
      [Logger.KEY_DETAILS]: sourceDetails,
      [Logger.KEY_SOURCE]: ignoredSource,
      [Logger.KEY_HOST]: ignoredHostName,
      ...context1
    } = context;

    // In case of conflict, argument details overwrites caller details.
    const mergedDetails = { ...sourceDetails, ...details };

    const context2 = {
      ...super.buildContext(mergedDetails, source),
      [source]: context1,
      [Logger.KEY_HOST]: this.hostname,
    };

    return context2;
  }

  /**
   * Handle a log message from the client.
   *
   * @param {IncomingMessage} req
   *   The request.
   * @param {ServerResponse} res
   *   The response.
   * @param {function} next
   *   A callback, not used currently.
   *
   * @returns {void}
   */
  handleClientLogRequest(req, res) {
    const method = req.method.toUpperCase();
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

    req.on("data", chunk => { body += chunk; });

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
          const { [Logger.KEY_DETAILS]: details, ...nonDetails } = context;
          this.logExtended(level, message, details, nonDetails, ClientLogger.side);
          res.statusCode = 200;
          result = "";
        }
        catch (err) {
          res.statusCode = 422;
          result = `Could not parse JSON message: ${err.message}.`;
        }
        res.end(result);
      },
      console.log
    ));
  }

  /**
   * @inheritDoc
   */
  log(level, message, rawContext = {}, cooked = true) {
    rawContext.hostname = this.hostname;
    super.log(level, message, rawContext, cooked);
  }

  /**
   * Extended syntax for log() method.
   *
   * @private
   *
   * @param {number} level
   *   The event level.
   * @param {string} message
   *   The event message.
   * @param {Object} details
   *   The details submitted with the message: any additional data added to
   *   the message by the upstream (client/cordova) log() caller().
   * @param {Object} context
   *   The context added to the details by upstream processors.
   * @param {string} source
   *   The upstream sender type.
   *
   * @returns {void}
   *
   * @throws InvalidArgumentException
   */
  logExtended(level, message, details, context, source) {
    this.validateLevel(level);
    const context1 = this.buildContext(details, source, context);
    const context2 = this.applyProcessors(context1);
    const {
      [Logger.KEY_DETAILS]: processedDetails,
      [Logger.KEY_SOURCE]: processedSource,
      [source]: processedSourceContext,
      [Logger.KEY_HOST]: processedHost,
      [Logger.KEY_TS]: processedTs,
      ...serverContext
    } = context2;

    const context3 = {
      [Logger.KEY_DETAILS]: processedDetails,
      [Logger.KEY_SOURCE]: processedSource,
      [source]: processedSourceContext,
      [Logger.KEY_HOST]: processedHost,
      [Logger.KEY_TS]: processedTs,
      [ServerLogger.side]: serverContext,
    };
    this.stamp(context3, "log");

    this.send(this.strategy, level, message, context3);
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
  logMethod({ level = LogLevel.INFO, message = "", context = {} }) {
    this.logExtended(level, message, {}, context, ClientLogger.side);
  }

  /**
   * Return a plain message string from any shape of document.
   *
   * @param {*} doc
   *   Expect it to be an object with a "message" key with a string value, but
   *   accept anything.
   *
   * @returns {*}
   *   A string, as close to the string representation of doc.message as
   *   feasible.
   */
  static stringifyMessage(doc) {
    if (typeof doc === "string") {
      return doc;
    }

    const rawMessage = doc.message;

    if (rawMessage) {
      if (typeof rawMessage === "string") {
        return rawMessage;
      }
      else if (rawMessage.toString.constructor.name === "Function") {
        return rawMessage.toString();
      }
    }

    const message = util.inspect(doc);
    return message;
  }

  /**
   * Return a plain object for all types of context values.
   *
   * @param {*} rawContext
   *   Expect a POJO but accept just about anything.
   *
   * @returns {{}}
   *   - Contexts which are objects are returned as the same key/values, but as
   *     POJOs, even for arrays.
   *   - Scalar contexts are returned as { value: <original value> }
   */
  static objectifyContext(rawContext) {
    let context;
    if (typeof rawContext === "object") {
      // JS null is an object: handle it like a scalar.
      if (rawContext === null) {
        context = { value: null };
      }
      else {
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
    }
    // Other data types are scalars, so we need to wrap them in an object.
    else {
      context = { value: rawContext };
    }
    return context;
  }

  /**
   * Sets up the Connect routing within the Meteor webapp component.
   *
   * @param {WebApp} webapp
   *   The Meteor webapp service (Connect wrapper).
   * @param {String} servePath
   *   The path on which to expose the server logger. Must NOT start by a "/".
   *
   * @returns {void}
   */
  setupConnect(webapp, servePath) {
    this.webapp = webapp;
    if (this.webapp) {
      if (this.verbose) {
        this.output.write(`Serving logger on ${servePath}.\n`);
      }
      let app = this.webapp.connectHandlers;
      app.use(this.servePath, this.handleClientLogRequest.bind(this));
    }
    else {
      if (this.verbose) {
        this.output.write(`Not serving logger, path ${servePath}.\n`);
      }
    }
  }
}

ServerLogger.side = SIDE;

export default ServerLogger;
