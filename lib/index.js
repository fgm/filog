"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TeeSender = exports.SyslogSender = exports.MongodbSender = exports.MeteorClientMethodSender = exports.MeteorClientHttpSender = exports.ConsoleSender = exports.NullSender = exports.SenderBase = exports.TrivialStrategy = exports.LeveledStrategy = exports.StrategyBase = exports.RoutingProcessor = exports.MeteorUserProcessor = exports.BrowserProcessor = exports.ProcessorBase = exports.ServerLogger = exports.ClientLogger = exports.Logger = exports.LogLevel = exports.InvalidArgumentException = undefined;

var _InvalidArgumentException = require("./InvalidArgumentException");

var _InvalidArgumentException2 = _interopRequireDefault(_InvalidArgumentException);

var _LogLevel = require("./LogLevel");

var _LogLevel2 = _interopRequireDefault(_LogLevel);

var _Logger = require("./Logger");

var _Logger2 = _interopRequireDefault(_Logger);

var _ServerLogger = require("./ServerLogger");

var _ServerLogger2 = _interopRequireDefault(_ServerLogger);

var _ClientLogger = require("./ClientLogger");

var _ClientLogger2 = _interopRequireDefault(_ClientLogger);

var _ProcessorBase = require("./Processors/ProcessorBase");

var _ProcessorBase2 = _interopRequireDefault(_ProcessorBase);

var _BrowserProcessor = require("./Processors/BrowserProcessor");

var _BrowserProcessor2 = _interopRequireDefault(_BrowserProcessor);

var _MeteorUserProcessor = require("./Processors/MeteorUserProcessor");

var _MeteorUserProcessor2 = _interopRequireDefault(_MeteorUserProcessor);

var _RoutingProcessor = require("./Processors/RoutingProcessor");

var _RoutingProcessor2 = _interopRequireDefault(_RoutingProcessor);

var _StrategyBase = require("./Strategies/StrategyBase");

var _StrategyBase2 = _interopRequireDefault(_StrategyBase);

var _LeveledStrategy = require("./Strategies/LeveledStrategy");

var _LeveledStrategy2 = _interopRequireDefault(_LeveledStrategy);

var _TrivialStrategy = require("./Strategies/TrivialStrategy");

var _TrivialStrategy2 = _interopRequireDefault(_TrivialStrategy);

var _SenderBase = require("./Senders/SenderBase");

var _SenderBase2 = _interopRequireDefault(_SenderBase);

var _NullSender = require("./Senders/NullSender");

var _NullSender2 = _interopRequireDefault(_NullSender);

var _ConsoleSender = require("./Senders/ConsoleSender");

var _ConsoleSender2 = _interopRequireDefault(_ConsoleSender);

var _MeteorClientHttpSender = require("./Senders/MeteorClientHttpSender");

var _MeteorClientHttpSender2 = _interopRequireDefault(_MeteorClientHttpSender);

var _MeteorClientMethodSender = require("./Senders/MeteorClientMethodSender");

var _MeteorClientMethodSender2 = _interopRequireDefault(_MeteorClientMethodSender);

var _MongodbSender = require("./Senders/MongodbSender");

var _MongodbSender2 = _interopRequireDefault(_MongodbSender);

var _TeeSender = require("./Senders/TeeSender");

var _TeeSender2 = _interopRequireDefault(_TeeSender);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* modern-syslog is not usable on the client side, because it fails to load
 * its compiled binary dependency.
 *
 * @type {NullSender|SyslogSender}
 */
var SyslogSender = Meteor.isServer ? require("./Senders/SyslogSender").default : _NullSender2.default;

exports.InvalidArgumentException = _InvalidArgumentException2.default;
exports.LogLevel = _LogLevel2.default;
exports.Logger = _Logger2.default;
exports.ClientLogger = _ClientLogger2.default;
exports.ServerLogger = _ServerLogger2.default;
exports.ProcessorBase = _ProcessorBase2.default;
exports.BrowserProcessor = _BrowserProcessor2.default;
exports.MeteorUserProcessor = _MeteorUserProcessor2.default;
exports.RoutingProcessor = _RoutingProcessor2.default;
exports.StrategyBase = _StrategyBase2.default;
exports.LeveledStrategy = _LeveledStrategy2.default;
exports.TrivialStrategy = _TrivialStrategy2.default;
exports.SenderBase = _SenderBase2.default;
exports.NullSender = _NullSender2.default;
exports.ConsoleSender = _ConsoleSender2.default;
exports.MeteorClientHttpSender = _MeteorClientHttpSender2.default;
exports.MeteorClientMethodSender = _MeteorClientMethodSender2.default;
exports.MongodbSender = _MongodbSender2.default;
exports.SyslogSender = SyslogSender;
exports.TeeSender = _TeeSender2.default;