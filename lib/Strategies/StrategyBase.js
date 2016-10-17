'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Strategies customize the active Sender instances for a given log event.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _NullSender = require('../Senders/NullSender');

var _NullSender2 = _interopRequireDefault(_NullSender);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StrategyBase = function () {
  function StrategyBase() {
    var init = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

    _classCallCheck(this, StrategyBase);

    if (init) {
      this.senders = [new _NullSender2.default()];
    }
  }

  /**
   * Select senders to use for a given log event.
   *
   * @param {int} level
   *   The log event level..
   * @param {string} message
   *   The log event string/template.
   * @param {object} context
   *   The context of the log event.
   *
   * @returns {function[]}
   *   An array of senders to use for this event.
   */


  _createClass(StrategyBase, [{
    key: 'selectSenders',
    value: function selectSenders(level, message, context) {
      return this.senders;
    }

    /**
     * This method may modify the logger methods, e.g. to do nothing on debug.
     *
     * @param {Logger} logger
     */

  }, {
    key: 'customizeLogger',
    value: function customizeLogger(logger) {}
  }]);

  return StrategyBase;
}();

exports.default = StrategyBase;