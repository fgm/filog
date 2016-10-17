import Logger from './Logger';
import * as util from 'util';
import * as _ from 'lodash';

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
   * @param {object} mongo
   *   The Meteor Mongo service.
   * @param {object} webapp
   *   The Meteor WebApp service.
   * @param {Object} parameters
   *   - servePath: the path on which to expose the logger endpoint.
   *   - collectionName: the collection in which to store log data
   */
  constructor(mongo, webapp = null, parameters = {}) {
    super();
    const defaultParameters = {
      servePath: '/logger',
      collectionName: 'logger'
    };

    for (const key in defaultParameters) {
      this[key] = (typeof parameters[key] !== 'undefined')
        ? parameters[key]
        : defaultParameters[key];
    }

    this.setupMongo(mongo, this.collectionName);
    this.setupConnect(webapp, this.servePath);
  }

  log(level, message, context) {
    let doc = { level, message };
    if (typeof context !== 'undefined') {
      doc.context = context;
    }
    this.store.insert(doc);
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

    // @TODO Node defaults to 10 listeners, but we need 11. Find out why.
    req.setMaxListeners(20);

    req.on('data', Meteor.bindEnvironment(buf => {
      const doc = JSON.parse(buf.toString('utf-8'));
      // RFC 5424 Table 2: 7 == debug
      const level = doc.level ? doc.level : 7;
      let message = 'Message not set';
      if (doc.message) {
        if (typeof doc.message === 'string') {
          message = doc.message;
        }
        else if (typeof doc.message.toString === 'function') {
          message = doc.message.toString();
        }
        else {
          message = util.inspect(doc);
        }
      }
      const context = _.omit(doc, ['level', 'message']);
      this.log(level, message, context);
    }, (e) => { console.log(e); }));
    res.end('');
  }

  setupMongo(mongo, collectionName) {
    this.mongo = mongo;
    let collection = this.mongo.Collection.get(collectionName);
    this.store = collection ? collection : new this.mongo.Collection(collectionName);
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
