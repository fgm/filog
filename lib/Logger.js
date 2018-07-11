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

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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

  _createClass(Logger, [{
    key: "applyProcessors",
    value: function applyProcessors(rawContext) {
      // Context may contain message_details and timestamps from upstream. Merge them.
      var DETAILS_KEY = "message_details";
      var TS_KEY = "timestamp";
      var HOST_KEY = "hostname";

      var context1 = rawContext;
      if (!rawContext[DETAILS_KEY]) {
        context1 = _defineProperty({}, DETAILS_KEY, rawContext);
      }

      var initialDetails = rawContext[DETAILS_KEY],
          initialTs = rawContext[TS_KEY],
          initialHost = rawContext[HOST_KEY],
          contextWithoutDetails = _objectWithoutProperties(rawContext, [DETAILS_KEY, TS_KEY, HOST_KEY]);

      var processedContext = this.processors.reduce(this.processorReducer, context1);

      var processedDetails = _extends({}, initialDetails, processedContext[DETAILS_KEY]);
      if (Object.keys(processedDetails).length > 0) {
        processedContext[DETAILS_KEY] = processedDetails;
      }
      processedContext[TS_KEY] = _extends({}, initialTs, processedContext[TS_KEY]);

      // Only add the initial [HOST_KEY] if none has been added and one existed.
      if (typeof processedContext[HOST_KEY] === "undefined" && typeof initialHost !== "undefined") {
        processedContext[HOST_KEY] = initialHost;
      }

      // // Set aside reserved keys to allow restoring them after processing.
      // const {
      //   [DETAILS_KEY]: initialDetails,
      //   [TS_KEY]: initialTs,
      //   [HOST_KEY]: initialHost,
      //   ...contextWithoutDetails
      // } = rawContext;
      //
      // const processedContext = this.processors.reduce(processorReducer, { [DETAILS_KEY]: contextWithoutDetails });
      //
      // // New context details keys, if any, with the same name override existing ones.
      // const details = { ...initialDetails, ...processedContext[DETAILS_KEY] };
      // if (Object.keys(details).length > 0) {
      //   processedContext[DETAILS_KEY] = details;
      // }
      // processedContext[TS_KEY] = { ...initialTs, ...processedContext[TS_KEY] };
      //
      // // Only add the initial [HOST_KEY] if none has been added and one existed.
      // if (typeof processedContext[HOST_KEY] === "undefined" && typeof initialHost !== "undefined") {
      //   processedContext[HOST_KEY] = initialHost;
      // }

      return processedContext;
    }
  }, {
    key: "doProcess",
    value: function doProcess(apply, contextToProcess) {
      var finalContext = apply ? this.applyProcessors(contextToProcess) : contextToProcess;

      // A timestamp is required, so insert it forcefully.
      finalContext.timestamp = { log: Date.now() };
      return finalContext;
    }

    /**
     * Reduce callback for processors.
     *
     * @private
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
     * @private
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
     * Ensure a log level is in the allowed value set.
     *
     * @see Logger.log()
     *
     * @param {*} requestedLevel
     *   A possibly invalid severity level.
     *
     * @returns {void}
     */

  }, {
    key: "validateLevel",
    value: function validateLevel(requestedLevel) {
      if (!Number.isInteger(requestedLevel) || +requestedLevel < _LogLevel2.default.EMERGENCY || +requestedLevel > _LogLevel2.default.DEBUG) {
        throw new _InvalidArgumentException2.default("The level argument to log() must be an RFC5424 level.");
      }
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
      var finalContext = this.doProcess(process, details);
      this.send(this.strategy, level, message, finalContext);
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