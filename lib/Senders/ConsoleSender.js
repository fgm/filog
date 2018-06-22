"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _LogLevel = require("../LogLevel");

var _LogLevel2 = _interopRequireDefault(_LogLevel);

var _SenderBase2 = require("./SenderBase");

var _SenderBase3 = _interopRequireDefault(_SenderBase2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileOverview Console Sender class.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


/**
 * ConsoleSender sends the log events it receives to the browser console.
 *
 * @extends SenderBase
 */
var ConsoleSender = function (_SenderBase) {
  _inherits(ConsoleSender, _SenderBase);

  function ConsoleSender() {
    _classCallCheck(this, ConsoleSender);

    var _this = _possibleConstructorReturn(this, (ConsoleSender.__proto__ || Object.getPrototypeOf(ConsoleSender)).call(this));

    if (!console) {
      throw new Error("Console sender needs a console object.");
    }
    return _this;
  }

  /** @inheritDoc */


  _createClass(ConsoleSender, [{
    key: "send",
    value: function send(level, message, context) {
      var methods = [console.error, console.error, console.error, console.error, console.warn, console.warn, console.info, console.log];

      var method = methods[level].bind(console);
      method(_LogLevel2.default.Names[level], message, context);
    }
  }]);

  return ConsoleSender;
}(_SenderBase3.default);

exports.default = ConsoleSender;