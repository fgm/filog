"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _Logger2 = require("./Logger");

var _Logger3 = _interopRequireDefault(_Logger2);

var _util = require("util");

var util = _interopRequireWildcard(_util);

var _os = require("os");

var _LogLevel = require("./LogLevel");

var _LogLevel2 = _interopRequireDefault(_LogLevel);

var _process = require("process");

var _process2 = _interopRequireDefault(_process);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileOverview Server-side Logger.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


/**
 * An extension of the base logger which accepts log input on a HTTP URL.
 *
 * Its main method is log(level, message, context).
 *
 * @see ServerLogger.log
 */
var ServerLogger = function (_Logger) {
  _inherits(ServerLogger, _Logger);

  // noinspection JSClassNamingConvention
  /**
   * @constructor
   *
   * @param {StrategyBase} strategy
   *   A logging strategy instance.
   * @param {WebApp} webapp
   *   The Meteor WebApp service.
   * @param {Object} parameters
   * - logRequestHeaders: add request headers to the log context. Defaults to true.
   * - servePath: the path on which to expose the logger endpoint. Defaults to "/logger".
   * - enableMethod: enable the filog:log method or not. Defaults to true.
   */
  function ServerLogger(strategy) {
    var webapp = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var parameters = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, ServerLogger);

    var _this = _possibleConstructorReturn(this, (ServerLogger.__proto__ || Object.getPrototypeOf(ServerLogger)).call(this, strategy));

    _this.output = _process2.default.stdout;
    var defaultParameters = {
      enableMethod: true,
      logRequestHeaders: true,
      // Preserve the legacy Filog default, but allow configuration.
      maxReqListeners: 11,
      servePath: "/logger"
    };

    // Loop on defaults, not arguments, to avoid injecting any random junk.
    for (var key in defaultParameters) {
      if (defaultParameters.hasOwnProperty(key)) {
        _this[key] = typeof parameters[key] !== "undefined" ? parameters[key] : defaultParameters[key];
      }
    }

    _this.hostname = (0, _os.hostname)();

    if (_this.enableMethod) {
      Meteor.methods(_defineProperty({}, _Logger3.default.METHOD, _this.logMethod.bind(_this)));
    }

    _this.setupConnect(webapp, _this.servePath);
    return _this;
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


  _createClass(ServerLogger, [{
    key: "handleClientLogRequest",
    value: function handleClientLogRequest(req, res) {
      var _this2 = this;

      var method = req.method.toUpperCase();
      if (method !== "POST") {
        // RFC2616: 405 means Method not allowed.
        res.writeHead(405);
        res.end();
        return;
      }

      // Early filog versions needed at least 11, while Node.JS is 10.
      // This appears to no longer be needed, but ensure it can be configured.
      req.setMaxListeners(this.maxReqListeners);

      var body = "";
      req.setEncoding("utf-8");

      req.on("data", function (chunk) {
        body += chunk;
      });

      req.on("end", Meteor.bindEnvironment(function () {
        var result = void 0;
        try {
          var doc = JSON.parse(body);
          // RFC 5424 Table 2: 7 == debug.
          var level = typeof doc.level !== "undefined" ? parseInt(doc.level, 10) : 7;
          var message = ServerLogger.stringifyMessage(doc);
          if (typeof doc.context === "undefined") {
            doc.context = {};
          }
          var context = ServerLogger.objectifyContext(doc.context);
          if (_this2.logRequestHeaders) {
            context.requestHeaders = req.headers;
          }
          _this2.log(level, message, context, false);
          res.statusCode = 200;
          result = "";
        } catch (err) {
          res.statusCode = 422;
          result = "Could not parse JSON message: " + err.message + ".";
        }
        res.end(result);
      }, console.log));
    }

    /**
     * @inheritDoc
     */

  }, {
    key: "log",
    value: function log(level, message) {
      var rawContext = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var cooked = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

      rawContext.hostname = this.hostname;
      console.log([level, message, rawContext]);
      _get(ServerLogger.prototype.__proto__ || Object.getPrototypeOf(ServerLogger.prototype), "log", this).call(this, level, message, rawContext, cooked);
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

  }, {
    key: "logMethod",
    value: function logMethod(_ref) {
      var _ref$level = _ref.level,
          level = _ref$level === undefined ? _LogLevel2.default.INFO : _ref$level,
          _ref$message = _ref.message,
          message = _ref$message === undefined ? "" : _ref$message,
          _ref$context = _ref.context,
          context = _ref$context === undefined ? {} : _ref$context;

      this.log(level, message, context, true);
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

  }, {
    key: "setupConnect",


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
    value: function setupConnect(webapp, servePath) {
      this.webapp = webapp;
      if (this.webapp) {
        this.output.write("Serving logger on " + servePath + ".\n");
        var app = this.webapp.connectHandlers;
        app.use(this.servePath, this.handleClientLogRequest.bind(this));
      } else {
        this.output.write("Not serving logger, path " + servePath + ".\n");
      }
    }
  }], [{
    key: "stringifyMessage",
    value: function stringifyMessage(doc) {
      if (typeof doc === "string") {
        return doc;
      }

      var rawMessage = doc.message;

      if (rawMessage) {
        if (typeof rawMessage === "string") {
          return rawMessage;
        } else if (typeof rawMessage.toString === "function") {
          return rawMessage.toString();
        }
      }

      var message = util.inspect(doc);
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

  }, {
    key: "objectifyContext",
    value: function objectifyContext(rawContext) {
      var context = void 0;
      if ((typeof rawContext === "undefined" ? "undefined" : _typeof(rawContext)) === "object") {
        // JS null is an object: handle it like a scalar.
        if (rawContext === null) {
          context = { value: null };
        } else {
          var className = rawContext.constructor.name;
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
  }]);

  return ServerLogger;
}(_Logger3.default);

exports.default = ServerLogger;