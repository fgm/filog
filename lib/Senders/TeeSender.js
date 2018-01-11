"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _SenderBase2 = require("./SenderBase");

var _SenderBase3 = _interopRequireDefault(_SenderBase2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileOverview Tee Sender class.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

/**
 * Like a UNIX tee(1), the TeeSender sends its input to multiple outputs.
 *
 * @extends SenderBase
 */
var TeeSender = function (_SenderBase) {
  _inherits(TeeSender, _SenderBase);

  /**
   * Constructor.
   *
   * @param {Array} senders
   *   An array of senders to which to send the input.
   */
  function TeeSender(senders) {
    _classCallCheck(this, TeeSender);

    var _this = _possibleConstructorReturn(this, (TeeSender.__proto__ || Object.getPrototypeOf(TeeSender)).call(this));

    _this.senders = senders;
    return _this;
  }

  /** @inheritdoc */


  _createClass(TeeSender, [{
    key: "send",
    value: function send(level, message, context) {
      var result = this.senders.map(function (sender) {
        return sender.send(level, message, context);
      });
      return result;
    }
  }]);

  return TeeSender;
}(_SenderBase3.default);

exports.default = TeeSender;