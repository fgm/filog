"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @fileOverview Base Logger class.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _tracekit = require("tracekit");

var _tracekit2 = _interopRequireDefault(_tracekit);

var _LogLevel = require("./LogLevel");

var _LogLevel2 = _interopRequireDefault(_LogLevel);

var _InvalidArgumentException = require("./InvalidArgumentException");

var _InvalidArgumentException2 = _interopRequireDefault(_InvalidArgumentException);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// const logMethodNames = ["log", "debug", "info", "warn", "error", "_exception" ];

var SIDE = "unknown";

/**
 * Logger is the base class for loggers.
 *
 * @property {string} side
 *   Which logger is this? Expected values: "client", "server", "cordova".
 * @property {string} KEY_DETAILS
 * @property {string} KEY_HOST
 * @property {string} KEY_SOURCE
 * @property {string} KEY_TS
 * @property {string} METHOD
 */
var Logger = function () {
  /**
   * @constructor
   *
   * @param {StrategyBase} strategy
   *   The sender selection strategy to apply.
   *
   */
  function Logger(strategy) {
    _classCallCheck(this, Logger);

    this.processors = [];
    this.side = SIDE;
    this.strategy = strategy;
    this.tk = _tracekit2.default;

    this.strategy.customizeLogger(this);
  }

  /**
   * Apply processors to a context, preserving reserved keys.
   *
   * @protected
   *
   * @param {Object} rawContext
   *   The context to process.
   *
   * @returns {Object}
   *   The processed context.
   */


  _createClass(Logger, [{
    key: "applyProcessors",
    value: function applyProcessors(rawContext) {
      var initialTs = rawContext[Logger.KEY_TS],
          initialHost = rawContext[Logger.KEY_HOST];


      var processedContext = this.processors.reduce(this.processorReducer, rawContext);

      // Timestamp is protected against modifications, for traceability.
      processedContext[Logger.KEY_TS] = _extends({}, initialTs, processedContext[Logger.KEY_TS]);

      // Only add the initial [Logger.KEY_HOST] if none has been added and one existed.
      if (typeof processedContext[Logger.KEY_HOST] === "undefined" && typeof initialHost !== "undefined") {
        processedContext[Logger.KEY_HOST] = initialHost;
      }

      return processedContext;
    }

    /**
     * Arm the report subscriber.
     *
     * @returns {void}
     *
     * @see Logger#reportSubscriber
     */

  }, {
    key: "arm",
    value: function arm() {
      this.tk.report.subscribe(this.reportSubscriber.bind(this));
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

  }, {
    key: "buildContext",
    value: function buildContext(details, source) {
      var _extends2;

      var context = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      var context1 = _extends({}, context, (_extends2 = {}, _defineProperty(_extends2, Logger.KEY_DETAILS, details), _defineProperty(_extends2, Logger.KEY_SOURCE, source), _extends2));

      if (details[Logger.KEY_HOST]) {
        context1[Logger.KEY_HOST] = details[Logger.KEY_HOST];
        delete context1[Logger.KEY_DETAILS][Logger.KEY_HOST];
      }

      return context1;
    }

    /**
     * Implementation compatibility to replace Meteor.debug.
     *
     * @returns {void}
     *
     * @see Meteor.debug
     */

  }, {
    key: "debug",
    value: function debug() {
      this.log.apply(this, [_LogLevel2.default.DEBUG].concat(Array.prototype.slice.call(arguments)));
    }

    /**
     * Disarm the subscriber.
     *
     * In most cases, we do not want to disarm immediately: a stack trace being
     * build may take several hundred milliseconds, and we would lose it.
     *
     * @param {Number} delay
     *   The delay before actually disarming, in milliseconds.
     *
     * @returns {void}
     */

  }, {
    key: "disarm",
    value: function disarm() {
      var _this = this;

      var delay = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2000;

      setTimeout(function () {
        _this.tk.report.unsubscribe(_this.reportSubscriber);
      }, delay);
    }

    /**
     * Implementation compatibility to replace Meteor.error.
     *
     * @returns {void}
     *
     * @see Meteor.error
     */

  }, {
    key: "error",
    value: function error() {
      this.log.apply(this, [_LogLevel2.default.ERROR].concat(Array.prototype.slice.call(arguments)));
    }

    /**
     * Implementation compatibility to replace Meteor.info.
     *
     * @returns {void}
     *
     * @see Meteor.info
     */

  }, {
    key: "info",
    value: function info() {
      this.log.apply(this, [_LogLevel2.default.INFORMATIONAL].concat(Array.prototype.slice.call(arguments)));
    }

    /**
     * Map a syslog level to its standard name.
     *
     * @param {Number} level
     *   An RFC5424 level.
     *
     * @returns {String}
     *   The english name for the level.
     */

  }, {
    key: "log",


    /**
     * Log an event. This is the *MAIN* method in the whole package.
     *
     * @param {Number} level
     *   An RFC5424 severity level.
     * @param {Object|String} message
     *   - If it is a string, the message body
     *   - Otherwise it must be an object with a "message" key.
     *   It may contain placeholders to be substituted with values from the
     *   context object, as in PSR-3.
     * @param {Object} details
     *   (Optional). An object complementing the message.
     * @param {Boolean} process
     *   (Optional). Apply processors to context before sending. Default == true.
     *
     * @returns {void}
     *
     * @throws InvalidArgumentException
     *   As per PSR-3, if level is not a valid RFC5424 level.
     *
     * @see https://tools.ietf.org/html/rfc5424
     * @see http://www.php-fig.org/psr/psr-3/
     */
    value: function log(level, message) {
      var details = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var process = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

      this.validateLevel(level);
      var context1 = this.buildContext(details, this.side);

      var context2 = process ? this.applyProcessors(context1) : context1;

      this.stamp(context2, "log");

      this.send(this.strategy, level, message, context2);
    }

    /**
     * Reduce callback for processors.
     *
     * @private
     *
     * @see Logger.log()
     *
     * @param {Object} accu
     *   The reduction accumulator.
     * @param {ProcessorBase} current
     *   The current process to apply in the reduction.
     *
     * @returns {Object}
     *   The result of the current reduction step.
     *
     */

  }, {
    key: "processorReducer",
    value: function processorReducer(accu, current) {
      var result = current.process(accu);
      return result;
    }

    /**
     * The callback invoked by TraceKit
     *
     * @param {Error} e
     *   Error on which to report.
     *
     * @returns {void}
     */

  }, {
    key: "report",
    value: function report(e) {
      this.tk.report(e);
    }

    /**
     * Error-catching callback when the logger is arm()-ed.
     *
     * @param {Error} e
     *   The error condition to log.
     *
     * @returns {void}
     *
     * @see Logger#arm
     */

  }, {
    key: "reportSubscriber",
    value: function reportSubscriber(e) {
      this.log(_LogLevel2.default.ERROR, e.message, e);
    }

    /**
     * Actually send a message with a processed context using a strategy.
     *
     * @see Logger.log()
     * @protected
     *
     * @param {StrategyBase} strategy
     *   The sending strategy.
     * @param {number} level
     *   An RFC5424 level.
     * @param {string} message
     *   The message template.
     * @param {object} sentContext
     *   A message context, possibly including a message_details key to separate
     *   data passed to the log() call from data added by processors.
     *
     * @returns {void}
     */

  }, {
    key: "send",
    value: function send(strategy, level, message, sentContext) {
      var senders = strategy.selectSenders(level, message, sentContext);
      senders.forEach(function (sender) {
        sender.send(level, message, sentContext);
      });
    }

    /**
     * Add a timestamp to a context object.
     *
     * @param {Object} context
     *   Mutated. The context to stamp.
     * @param {string} op
     *   The operation for which to add a timestamp.
     *
     * @returns {void}
     */

  }, {
    key: "stamp",
    value: function stamp(context, op) {
      if (!context[Logger.KEY_TS]) {
        context[Logger.KEY_TS] = {};
      }
      if (!context[Logger.KEY_TS][this.side]) {
        context[Logger.KEY_TS][this.side] = {};
      }
      context[Logger.KEY_TS][this.side][op] = +new Date();
    }

    /**
     * Ensure a log level is in the allowed value set.
     *
     * @see Logger.log()
     *
     * @param {*} requestedLevel
     *   A possibly invalid severity level.
     *
     * @returns {void}
     *
     * @throws InvalidArgumentException
     */

  }, {
    key: "validateLevel",
    value: function validateLevel(requestedLevel) {
      if (!Number.isInteger(requestedLevel) || +requestedLevel < _LogLevel2.default.EMERGENCY || +requestedLevel > _LogLevel2.default.DEBUG) {
        throw new _InvalidArgumentException2.default("The level argument to log() must be an RFC5424 level.");
      }
    }

    /**
     * Implementation compatibility to replace Meteor.warn.
     *
     * @returns {void}
     *
     * @see Meteor.warn
     */

  }, {
    key: "warn",
    value: function warn() {
      this.log.apply(this, [_LogLevel2.default.WARNING].concat(Array.prototype.slice.call(arguments)));
    }

    /**
     * Implements the standard Meteor logger methods.
     *
     * This method is an implementation detail: do not depend on it.
     *
     * @param {String} level
     *   debug, info, warn, or error
     *
     * @returns {void}
     *
     * @todo (or not ?) merge in the funky Meteor logic from the logging package.
     */

  }, {
    key: "_meteorLog",
    value: function _meteorLog() {}
  }], [{
    key: "levelName",
    value: function levelName(level) {
      var numericLevel = Math.round(level);
      if (numericLevel < _LogLevel2.default.EMERGENCY || isNaN(numericLevel)) {
        numericLevel = _LogLevel2.default.EMERGENCY;
      } else if (numericLevel > _LogLevel2.default.DEBUG) {
        numericLevel = _LogLevel2.default.DEBUG;
      }
      return _LogLevel2.default.Names[numericLevel];
    }
  }]);

  return Logger;
}();

Logger.KEY_DETAILS = "message_details";
Logger.KEY_HOST = "hostname";
Logger.KEY_SOURCE = "source";
Logger.KEY_TS = "timestamp";
Logger.METHOD = "filog:log";
Logger.side = SIDE;

exports.default = Logger;