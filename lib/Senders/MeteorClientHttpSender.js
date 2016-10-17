'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _SenderBase2 = require('./SenderBase');

var _SenderBase3 = _interopRequireDefault(_SenderBase2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var nullFn = function nullFn() {};

var MeteorClientHttpSender = function (_SenderBase) {
  _inherits(MeteorClientHttpSender, _SenderBase);

  /**
   * @constructor
   *
   * @param {String} loggerUrl
   *   The absolute URL of the logger server. Usually /logger on the Meteor app.
   */

  function MeteorClientHttpSender(loggerUrl) {
    _classCallCheck(this, MeteorClientHttpSender);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(MeteorClientHttpSender).call(this));

    if (!Meteor || !Meteor.isClient) {
      throw new Error('MeteorClientHttpSender is only meant for Meteor client side.');
    }
    if (!HTTP) {
      throw new Error('MeteorClientHttpSender needs the Meteor http package to be active.');
    }

    _this.http = HTTP;
    _this.loggerUrl = loggerUrl;
    _this.requestHeaders = {
      'Content-Type': 'application/json'
    };
    return _this;
  }

  _createClass(MeteorClientHttpSender, [{
    key: 'send',
    value: function send(level, message, context) {
      var data = { level: level, message: message };
      if (typeof context !== 'undefined') {
        data.context = context;
      }

      var options = {
        data: data,
        headers: this.requestHeaders
      };
      this.http.post(this.loggerUrl, options, nullFn);
    }
  }]);

  return MeteorClientHttpSender;
}(_SenderBase3.default);

exports.default = MeteorClientHttpSender;