'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _SenderBase2 = require('./SenderBase');

var _SenderBase3 = _interopRequireDefault(_SenderBase2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Defines an explicit null sender.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Although SenderBase is also null, this is not its defining characteristic
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * hence this alias.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var NullSender = function (_SenderBase) {
  _inherits(NullSender, _SenderBase);

  function NullSender() {
    _classCallCheck(this, NullSender);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(NullSender).apply(this, arguments));
  }

  return NullSender;
}(_SenderBase3.default);

exports.default = NullSender;