'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _tracekit = require('tracekit');

var _tracekit2 = _interopRequireDefault(_tracekit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// const logMethodNames = ['log', 'debug', 'info', 'warn', 'error', '_exception' ];

var Logger = function () {
  function Logger() {
    _classCallCheck(this, Logger);

    this.processors = [];
    this.tk = _tracekit2.default;
  }

  /**
   * The callback invoked by TraceKit
   *
   * @param {Error} e
   */


  _createClass(Logger, [{
    key: 'report',
    value: function report(e) {
      this.tk.report(e);
    }
  }, {
    key: 'reportSubscriber',
    value: function reportSubscriber(e) {
      this.log(3, e.message, e);
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

      var delay = arguments.length <= 0 || arguments[0] === undefined ? 2000 : arguments[0];

      setTimeout(function () {
        _this.tk.report.unsubscribe(_this.reportSubscriber);
      }, delay);
    }

    /** Implements the standard Meteor logger methods.
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
    key: 'log',
    value: function log(level, message, context) {
      console.log("Log in Logger", Logger.levelName(level), message, context);
    }
  }, {
    key: 'debug',
    value: function debug() {
      this.log.apply(this, [7].concat(Array.prototype.slice.call(arguments)));
    }
  }, {
    key: 'info',
    value: function info() {
      this.log.apply(this, [6].concat(Array.prototype.slice.call(arguments)));
    }
  }, {
    key: 'warn',
    value: function warn() {
      this.log.apply(this, [4].concat(Array.prototype.slice.call(arguments)));
    }
  }, {
    key: 'error',
    value: function error() {
      this.log.apply(this, [3].concat(Array.prototype.slice.call(arguments)));
    }
  }], [{
    key: 'levelName',
    value: function levelName(level) {
      var levels = {
        0: 'emergency',
        1: 'alert',
        2: 'critical',
        3: 'error',
        4: 'warning',
        5: 'notice',
        6: 'informational',
        7: 'debug'
      };
      var numericLevel = Math.round(level);
      if (numericLevel < 0) {
        numericLevel = 0;
      } else if (numericLevel > 7) {
        numericLevel = 7;
      }
      return levels[numericLevel];
    }
  }]);

  return Logger;
}();

exports.default = Logger;