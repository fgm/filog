"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _StrategyBase2 = require("./StrategyBase");

var _StrategyBase3 = _interopRequireDefault(_StrategyBase2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileOverview Trivial Strategy.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

/**
 * This strategy uses a single sender for all configurations.
 *
 * As such, it is mostly meant for tests.
 *
 * @extends StrategyBase
 */
var TrivialStrategy = function (_StrategyBase) {
  _inherits(TrivialStrategy, _StrategyBase);

  // noinspection JSClassNamingConvention
  /**
   * @constructor
   *
   * @param {function} sender
   *   The Sender to use for all events
   */
  function TrivialStrategy(sender) {
    _classCallCheck(this, TrivialStrategy);

    var _this = _possibleConstructorReturn(this, (TrivialStrategy.__proto__ || Object.getPrototypeOf(TrivialStrategy)).call(this, false));

    _this.senders = [sender];
    return _this;
  }

  return TrivialStrategy;
}(_StrategyBase3.default);

exports.default = TrivialStrategy;