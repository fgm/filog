"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var InvalidArgumentException_1 = __importDefault(require("./InvalidArgumentException"));
exports.InvalidArgumentException = InvalidArgumentException_1.default;
var LogLevel = __importStar(require("./LogLevel"));
exports.LogLevel = LogLevel;
var ClientLogger_1 = __importDefault(require("./ClientLogger"));
exports.ClientLogger = ClientLogger_1.default;
var Logger_1 = __importDefault(require("./Logger"));
exports.Logger = Logger_1.default;
var ServerLogger_1 = __importDefault(require("./ServerLogger"));
exports.ServerLogger = ServerLogger_1.default;
var BrowserProcessor_1 = require("./Processors/BrowserProcessor");
exports.BrowserProcessor = BrowserProcessor_1.BrowserProcessor;
var MeteorUserProcessor_1 = __importDefault(require("./Processors/MeteorUserProcessor"));
exports.MeteorUserProcessor = MeteorUserProcessor_1.default;
var ProcessorBase_1 = __importDefault(require("./Processors/ProcessorBase"));
exports.ProcessorBase = ProcessorBase_1.default;
var RoutingProcessor_1 = __importDefault(require("./Processors/RoutingProcessor"));
exports.RoutingProcessor = RoutingProcessor_1.default;
var LeveledStrategy_1 = __importDefault(require("./Strategies/LeveledStrategy"));
exports.LeveledStrategy = LeveledStrategy_1.default;
var StrategyBase_1 = __importDefault(require("./Strategies/StrategyBase"));
exports.StrategyBase = StrategyBase_1.default;
var TrivialStrategy_1 = __importDefault(require("./Strategies/TrivialStrategy"));
exports.TrivialStrategy = TrivialStrategy_1.default;
var ConsoleSender_1 = __importDefault(require("./Senders/ConsoleSender"));
exports.ConsoleSender = ConsoleSender_1.default;
var MeteorClientHttpSender_1 = __importDefault(require("./Senders/MeteorClientHttpSender"));
exports.MeteorClientHttpSender = MeteorClientHttpSender_1.default;
var MeteorClientMethodSender_1 = __importDefault(require("./Senders/MeteorClientMethodSender"));
exports.MeteorClientMethodSender = MeteorClientMethodSender_1.default;
var MongodbSender_1 = __importDefault(require("./Senders/MongodbSender"));
exports.MongodbSender = MongodbSender_1.default;
var NullSender_1 = __importDefault(require("./Senders/NullSender"));
exports.NullSender = NullSender_1.default;
var SenderBase_1 = __importDefault(require("./Senders/SenderBase"));
exports.SenderBase = SenderBase_1.default;
var TeeSender_1 = __importDefault(require("./Senders/TeeSender"));
exports.TeeSender = TeeSender_1.default;
/* modern-syslog is not usable on the client side, because it fails to load
 * its compiled binary dependency, hence the dynamic require and tslint disable.
 *
 * @type {NullSender|SyslogSender}
 */
var SyslogSender = Meteor.isServer
    // tslint:disable-next-line
    ? require("./Senders/SyslogSender").default
    : NullSender_1.default;
exports.SyslogSender = SyslogSender;
//# sourceMappingURL=index.js.map