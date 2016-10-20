import Logger from './Logger';
import * as util from 'util';

/**
 * An extension of the base logger which accepts log input on a HTTP URL.
 *
 * Its main method is log(level, message, context).
 *
 * @see ServerLogger.log
 */
class ServerLogger extends Logger {
  /**
   * @constructor
   *
   * @param {StrategyBase} strategy
   *   A logging strategy instance.
   * @param {object} webapp
   *   The Meteor WebApp service.
   * @param {Object} parameters
   *   - servePath: the path on which to expose the logger endpoint.
   */
  constructor(strategy, webapp = null, parameters = {}) {
    super(strategy);
    const defaultParameters = {
      servePath: '/logger'
    };

    // Loop on defaults, not arguments, to avoid injecting any random junk.
    for (const key in defaultParameters) {
      if (defaultParameters.hasOwnProperty(key)) {
        this[key] = (typeof parameters[key] !== 'undefined')
          ? parameters[key]
          : defaultParameters[key];
      }
    }

    this.setupConnect(webapp, this.servePath);
  }

  /**
   * Handle a log message from the client.
   *
   * @param {IncomingMessage} req
   * @param {ServerResponse} res
   * @param {function} next
   */
  handleClientLogRequest(req, res, next) {
    const method = req.method.toUpperCase();
    if (method !== 'POST') {
      // RFC2616: 405 means Method not allowed.
      res.writeHead(405);
      res.end();
      return;
    }
    res.writeHead(200);

    // @TODO Node defaults to 10 listeners, but we need at least 11. Find out why.
    req.setMaxListeners(20);

    req.on('data', Meteor.bindEnvironment(buf => {
      const doc = JSON.parse(buf.toString('utf-8'));
      // RFC 5424 Table 2: 7 == debug
      const level = doc.level ? doc.level : 7;
      const message = ServerLogger.stringifyMessage(doc.message);
      const context = ServerLogger.objectifyContext(doc.context);
      this.log(level, message, context, false);
    }, (e) => { console.log(e); }));
    res.end('');
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
    const rawMessage = doc.message;
    let message;

    if (rawMessage) {
      if (typeof rawMessage === 'string') {
        message = rawMessage;

      }
      else if (typeof rawMessage.toString === 'function') {
        message = rawMessage.toString();
      }
    }
    else if (typeof doc === 'string') {
      message = doc;
    }
    else {
      message = util.inspect(doc);
    }

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
    let context = {};
    if (typeof rawContext === 'object') {
      // For some reason, JS null is an object: handle it like a scalar.
      if (rawContext === null) {
        context = { value: null };
      }
      else if (rawContext.constructor.name === 'Date') {
        context = rawContext.toISOString();
      }
      // Arrays and classed objects need to be downgraded to POJOs.
      else if (rawContext.constructor.name != 'Object') {
        context = Object.assign({}, rawContext);
      }
      else {
        context = rawContext;
      }
    }
    // Other data types are scalars, so we need to wrap them in an object.
    else {
      context = { value: rawContext };
    }
    return context;
  }

  setupConnect(webapp, servePath) {
    this.webapp = webapp;
    if (this.webapp) {
      console.log('Serving logger on', servePath);
      let app = this.webapp.connectHandlers;
      app.use(this.servePath, this.handleClientLogRequest.bind(this));
    }
    else {
      console.log('Not serving logger, path', servePath);
    }
  }
}

export default ServerLogger;
