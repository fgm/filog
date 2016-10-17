'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Logger2 = require('./Logger');

var _Logger3 = _interopRequireDefault(_Logger2);

var _util = require('util');

var util = _interopRequireWildcard(_util);

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ServerLogger = function (_Logger) {
  _inherits(ServerLogger, _Logger);

  /**
   * @constructor
   *
   * @param {object} mongo
   *   The Meteor Mongo service.
   * @param {object} webapp
   *   The Meteor WebApp service.
   * @param {Object} parameters
   *   The path on which to expose the logger endpoint.
   */

  function ServerLogger(mongo) {
    var webapp = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
    var parameters = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    _classCallCheck(this, ServerLogger);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ServerLogger).call(this));

    var defaultParameters = {
      servePath: '/logger',
      collectionName: 'logger'
    };

    for (var key in defaultParameters) {
      _this[key] = typeof parameters[key] !== 'undefined' ? parameters[key] : defaultParameters[key];
    }

    _this.setupMongo(mongo, _this.collectionName);
    _this.setupConnect(webapp, _this.servePath);
    return _this;
  }

  _createClass(ServerLogger, [{
    key: 'log',
    value: function log(level, message, context) {
      var doc = { level: level, message: message };
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

  }, {
    key: 'handleClientLogRequest',
    value: function handleClientLogRequest(req, res, next) {
      var _this2 = this;

      var method = req.method.toUpperCase();
      if (method !== 'POST') {
        // RFC2616: 405 means Method not allowed.
        res.writeHead(405);
        res.end();
        return;
      }
      res.writeHead(200);

      // @TODO Node defaults to 10 listeners, but we need 11. Find out why.
      req.setMaxListeners(20);

      req.on('data', Meteor.bindEnvironment(function (buf) {
        var doc = JSON.parse(buf.toString('utf-8'));
        // RFC 5424 Table 2: 7 == debug
        var level = doc.level ? doc.level : 7;
        var message = 'Message not set';
        if (doc.message) {
          if (typeof doc.message === 'string') {
            message = doc.message;
          } else if (typeof doc.message.toString === 'function') {
            message = doc.message.toString();
          } else {
            message = util.inspect(doc);
          }
        }
        var context = _.omit(doc, ['level', 'message']);
        _this2.log(level, message, context);
      }, function (e) {
        console.log(e);
      }));
      res.end('');
    }
  }, {
    key: 'setupMongo',
    value: function setupMongo(mongo, collectionName) {
      this.mongo = mongo;
      var collection = this.mongo.Collection.get(collectionName);
      this.store = collection ? collection : new this.mongo.Collection(collectionName);
    }
  }, {
    key: 'setupConnect',
    value: function setupConnect(webapp, servePath) {
      this.webapp = webapp;
      if (this.webapp) {
        console.log('Serving logger on', servePath);
        var app = this.webapp.connectHandlers;
        app.use(this.servePath, this.handleClientLogRequest.bind(this));
      } else {
        console.log('Not serving logger, path', servePath);
      }
    }
  }]);

  return ServerLogger;
}(_Logger3.default);

exports.default = ServerLogger;