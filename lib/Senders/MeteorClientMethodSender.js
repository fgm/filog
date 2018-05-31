"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _SenderBase2 = require("./SenderBase");

var _SenderBase3 = _interopRequireDefault(_SenderBase2);

var _Logger = require("../Logger");

var _Logger2 = _interopRequireDefault(_Logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileOverview Meteor Client Method Sender class.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

/** global: Meteor */

/**
 * MeteorClientMethodSender send data from the client to the server over DDP.
 *
 * @extends SenderBase
 */
var MeteorClientMethodSender = function (_SenderBase) {
  _inherits(MeteorClientMethodSender, _SenderBase);

  /**
   * @constructor
   *
   * @param {String} loggerUrl
   *   The absolute URL of the logger server. Usually /logger on the Meteor app.
   */
  function MeteorClientMethodSender() {
    _classCallCheck(this, MeteorClientMethodSender);

    var _this = _possibleConstructorReturn(this, (MeteorClientMethodSender.__proto__ || Object.getPrototypeOf(MeteorClientMethodSender)).call(this));

    if (typeof Meteor === "undefined" || !Meteor.isClient) {
      throw new Error("MeteorClientMethodSender is only meant for Meteor client side.");
    }
    return _this;
  }

  _createClass(MeteorClientMethodSender, [{
    key: "send",
    value: function send(level, message, context) {
      var data = { level: level, message: message };
      if (typeof context !== "undefined") {
        data.context = context;
      }

      Meteor.call(_Logger2.default.METHOD, data);
    }
  }]);

  return MeteorClientMethodSender;
}(_SenderBase3.default);

exports.default = MeteorClientMethodSender;