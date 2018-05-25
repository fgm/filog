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

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// const logMethodNames = ["log", "debug", "info", "warn", "error", "_exception" ];

/**
 * Logger is the base class for loggers.
 */
var Logger = function () {
  /**
   * @constructor
   *
   * @param {StrategyBase} strategy
   *   The sender selection strategy to apply.
   */
  function Logger(strategy) {
    _classCallCheck(this, Logger);

    this.processors = [];
    this.strategy = strategy;
    this.tk = _tracekit2.default;

    this.strategy.customizeLogger(this);
  }

  /**
   * The callback invoked by TraceKit
   *
   * @param {Error} e
   *   Error on which to report.
   *
   * @returns {void}
   */


  _createClass(Logger, [{
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
     * @param {Object} initialContext
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
      var _this2 = this;

      var initialContext = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var process = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

      /**
       * Reduce callback for processors.
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
       */
      var processorReducer = function processorReducer(accu, current) {
        var result = current.process(accu);
        return result;
      };

      var applyProcessors = function applyProcessors(rawContext) {
        // Context may contain message_details and timestamps from upstream. Merge them.
        var DETAILS_KEY = "message_details";
        var TS_KEY = "timestamp";
        var HOST_KEY = "hostname";

        var initialDetails = rawContext[DETAILS_KEY],
            initialTs = rawContext[TS_KEY],
            initialHost = rawContext[HOST_KEY],
            contextWithoutDetails = _objectWithoutProperties(rawContext, [DETAILS_KEY, TS_KEY, HOST_KEY]);

        var processedContext = _this2.processors.reduce(processorReducer, _defineProperty({}, DETAILS_KEY, contextWithoutDetails));

        // New context details keys, if any, with the same name override existing ones.
        var details = _extends({}, initialDetails, processedContext[DETAILS_KEY]);
        if (Object.keys(details).length > 0) {
          processedContext[DETAILS_KEY] = details;
        }
        processedContext[TS_KEY] = _extends({}, initialTs, processedContext[TS_KEY]);

        // Only add the initial [HOST_KEY] if none has been added and one existed.
        if (typeof processedContext[HOST_KEY] === "undefined" && typeof initialHost !== "undefined") {
          processedContext[HOST_KEY] = initialHost;
        }

        return processedContext;
      };

      if (!Number.isInteger(level) || +level < _LogLevel2.default.EMERGENCY || +level > _LogLevel2.default.DEBUG) {
        throw new _InvalidArgumentException2.default("The level argument to log() must be an RFC5424 level.");
      }

      var finalContext = process ? applyProcessors(initialContext) : initialContext;

      // A timestamp is required, so insert it forcefully.
      finalContext.timestamp = { log: Date.now() };

      var senders = this.strategy.selectSenders(level, message, finalContext);
      senders.forEach(function (sender) {
        sender.send(level, message, finalContext);
      });
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

Logger.METHOD = "filog:log";

exports.default = Logger;