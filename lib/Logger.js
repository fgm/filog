'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _tracekit = require('tracekit');

var _tracekit2 = _interopRequireDefault(_tracekit);

var _LogLevel = require('./LogLevel');

var _LogLevel2 = _interopRequireDefault(_LogLevel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// const logMethodNames = ['log', 'debug', 'info', 'warn', 'error', '_exception' ];

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
    key: 'report',
    value: function report(e) {
      this.tk.report(e);
    }
  }, {
    key: 'reportSubscriber',
    value: function reportSubscriber(e) {
      this.log(_LogLevel2.default.ERROR, e.message, e);
    }

    /**
     * Arm the report subscriber.
     */

  }, {
    key: 'arm',
    value: function arm() {
      this.tk.report.subscribe(this.reportSubscriber.bind(this));
    }

    /**
     * Disarm the subscriber.
     *
     * In most cases, we do not want to disarm immediately: a stack trace being
     * build may take several hundred milliseconds, and we would lose it.
     *
     * @param delay
     */

  }, {
    key: 'disarm',
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
     * @param level
     *   debug, info, warn, or error
     * @private
     *
     * @todo (or not ?) merge in the funky Meteor logic from the logging package.
     */

  }, {
    key: '_meteorLog',
    value: function _meteorLog(level) {}
  }, {
    key: 'processorReducer',


    /**
     * Reduce callback for processors.
     *
     * @see Logger.log()
     *
     * @param {Object} accu
     *   The reduction accumulator.
     * @param {ProcessorBase} current
     *   The current process to apply in the reduction.
     * @param {Boolean} cooked
     *   Optiona, default true. Apply processors to context before sending.
     *
     * @returns {Object}
     *   The result of the current reduction step.
     */
    value: function processorReducer(accu, current) {
      var result = Object.assign(accu, current.process(accu));
      return result;
    }
  }, {
    key: 'log',
    value: function log(level, message) {
      var rawContext = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var cooked = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

      var context = cooked ? this.processors.reduce(this.processorReducer, rawContext) : rawContext;

      // A timestamp is required, so insert it forcefully.
      context.timestamp = { log: Date.now() };

      var senders = this.strategy.selectSenders(level, message, context);
      senders.forEach(function (sender) {
        sender.send(level, message, context);
      });
    }
  }, {
    key: 'debug',
    value: function debug() {
      this.log.apply(this, [_LogLevel2.default.DEBUG].concat(Array.prototype.slice.call(arguments)));
    }
  }, {
    key: 'info',
    value: function info() {
      this.log.apply(this, [_LogLevel2.default.INFORMATIONAL].concat(Array.prototype.slice.call(arguments)));
    }
  }, {
    key: 'warn',
    value: function warn() {
      this.log.apply(this, [_LogLevel2.default.WARNING].concat(Array.prototype.slice.call(arguments)));
    }
  }, {
    key: 'error',
    value: function error() {
      this.log.apply(this, [_LogLevel2.default.ERROR].concat(Array.prototype.slice.call(arguments)));
    }
  }], [{
    key: 'levelName',
    value: function levelName(level) {
      var numericLevel = Math.round(level);
      if (numericLevel < _LogLevel2.default.EMERGENCY) {
        numericLevel = _LogLevel2.default.EMERGENCY;
      } else if (numericLevel > _LogLevel2.default.DEBUG) {
        numericLevel = _LogLevel2.default.DEBUG;
      }
      return _LogLevel2.default.Names[numericLevel];
    }
  }]);

  return Logger;
}();

exports.default = Logger;