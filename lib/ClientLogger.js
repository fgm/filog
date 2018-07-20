"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Logger2 = require("./Logger");

var _Logger3 = _interopRequireDefault(_Logger2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileOverview Client-side Logger implementation.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var SIDE = "client";

/**
 * ClientLogger is the client-side implementation of Logger.
 *
 * In its current state, it brings nothing over Logger, simply providing an
 * extension-specialization point.
 *
 * @extends Logger
 *
 * @property {string} side
 */
var ClientLogger = function (_Logger) {
  _inherits(ClientLogger, _Logger);

  function ClientLogger(strategy) {
    _classCallCheck(this, ClientLogger);

    var _this = _possibleConstructorReturn(this, (ClientLogger.__proto__ || Object.getPrototypeOf(ClientLogger)).call(this, strategy));

    _this.side = SIDE;
    return _this;
  }

  return ClientLogger;
}(_Logger3.default);

ClientLogger.side = SIDE;

exports.default = ClientLogger;