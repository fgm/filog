"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _StrategyBase2 = require("./StrategyBase");

var _StrategyBase3 = _interopRequireDefault(_StrategyBase2);

var _LogLevel = require("../LogLevel");

var _LogLevel2 = _interopRequireDefault(_LogLevel);

var _SenderBase = require("../Senders/SenderBase");

var _SenderBase2 = _interopRequireDefault(_SenderBase);

var _NullFn = require("../NullFn");

var _NullFn2 = _interopRequireDefault(_NullFn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileOverview Level-based Strategy.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

/**
 * LeveledStrategy defines a single sender per level.
 *
 * @extends StrategyBase
 */
var LeveledStrategy = function (_StrategyBase) {
  _inherits(LeveledStrategy, _StrategyBase);

  // noinspection JSClassNamingConvention
  /**
   * @constructor
   *
   * @param {function} low
   *   The Sender to use for low-interest events.
   * @param {function} medium
   *   The Sender to use for medium-interest events.
   * @param {function} high
   *   The Sender to use for high-interest events.
   * @param {int} minLow
   *   The minimum level to handle as a low-interest event.
   * @param {int} maxHigh
   *   The maximum level to handle as a high-interest event.
   */
  function LeveledStrategy(low, medium, high) {
    var minLow = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : _LogLevel2.default.DEBUG;
    var maxHigh = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : _LogLevel2.default.WARNING;

    _classCallCheck(this, LeveledStrategy);

    var _this = _possibleConstructorReturn(this, (LeveledStrategy.__proto__ || Object.getPrototypeOf(LeveledStrategy)).call(this, false));
    // Do not initialize a default null sender.


    _this.senders = [low, medium, high];

    _this.low = low;
    _this.medium = medium;
    _this.high = high;
    _this.minLow = minLow;
    _this.maxHigh = maxHigh;

    _this.senders.forEach(function (sender) {
      if (!(sender instanceof _SenderBase2.default)) {
        throw new Error("LeveledStrategy: senders must be instances of a Sender class.");
      }
    });
    return _this;
  }

  _createClass(LeveledStrategy, [{
    key: "customizeLogger",
    value: function customizeLogger(logger) {
      var _this2 = this;

      ["low", "medium", "high"].forEach(function (level) {
        if (_this2[level].constructor.name === "NullSender") {
          logger.debug = _NullFn2.default;
        }
      });
    }

    /** @inheritdoc */

  }, {
    key: "selectSenders",
    value: function selectSenders(level) {
      var sender = void 0;
      if (level >= this.minLow) {
        sender = this.low;
      } else if (level <= this.maxHigh) {
        sender = this.high;
      } else {
        sender = this.medium;
      }

      return [sender];
    }
  }]);

  return LeveledStrategy;
}(_StrategyBase3.default);

exports.default = LeveledStrategy;