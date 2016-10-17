'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ServerLogger = exports.ClientLogger = undefined;

var _ServerLogger = require('./ServerLogger');

var _ServerLogger2 = _interopRequireDefault(_ServerLogger);

var _ClientLogger = require('./ClientLogger');

var _ClientLogger2 = _interopRequireDefault(_ClientLogger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.ClientLogger = _ClientLogger2.default;
exports.ServerLogger = _ServerLogger2.default;