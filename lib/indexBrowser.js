"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeeSender = exports.MongodbSender = exports.MeteorClientMethodSender = exports.MeteorClientHttpSender = exports.ConsoleSender = exports.NullSender = exports.SenderBase = exports.TrivialStrategy = exports.LeveledStrategy = exports.StrategyBase = exports.RoutingProcessor = exports.MeteorUserProcessor = exports.BrowserProcessor = exports.ProcessorBase = exports.ServerLogger = exports.ClientLogger = exports.Logger = exports.LogLevel = exports.InvalidArgumentException = void 0;
var InvalidArgumentException_1 = __importDefault(require("./InvalidArgumentException"));
exports.InvalidArgumentException = InvalidArgumentException_1.default;
var LogLevel = __importStar(require("./LogLevel"));
exports.LogLevel = LogLevel;
var ClientLogger_1 = require("./Loggers/ClientLogger");
Object.defineProperty(exports, "ClientLogger", { enumerable: true, get: function () { return ClientLogger_1.ClientLogger; } });
var Logger_1 = require("./Loggers/Logger");
Object.defineProperty(exports, "Logger", { enumerable: true, get: function () { return Logger_1.Logger; } });
var ServerLogger_1 = require("./Loggers/ServerLogger");
Object.defineProperty(exports, "ServerLogger", { enumerable: true, get: function () { return ServerLogger_1.ServerLogger; } });
var BrowserProcessor_1 = require("./Processors/BrowserProcessor");
Object.defineProperty(exports, "BrowserProcessor", { enumerable: true, get: function () { return BrowserProcessor_1.BrowserProcessor; } });
var MeteorUserProcessor_1 = require("./Processors/MeteorUserProcessor");
Object.defineProperty(exports, "MeteorUserProcessor", { enumerable: true, get: function () { return MeteorUserProcessor_1.MeteorUserProcessor; } });
var ProcessorBase_1 = require("./Processors/ProcessorBase");
Object.defineProperty(exports, "ProcessorBase", { enumerable: true, get: function () { return ProcessorBase_1.ProcessorBase; } });
var RoutingProcessor_1 = require("./Processors/RoutingProcessor");
Object.defineProperty(exports, "RoutingProcessor", { enumerable: true, get: function () { return RoutingProcessor_1.RoutingProcessor; } });
var LeveledStrategy_1 = require("./Strategies/LeveledStrategy");
Object.defineProperty(exports, "LeveledStrategy", { enumerable: true, get: function () { return LeveledStrategy_1.LeveledStrategy; } });
var StrategyBase_1 = require("./Strategies/StrategyBase");
Object.defineProperty(exports, "StrategyBase", { enumerable: true, get: function () { return StrategyBase_1.StrategyBase; } });
var TrivialStrategy_1 = require("./Strategies/TrivialStrategy");
Object.defineProperty(exports, "TrivialStrategy", { enumerable: true, get: function () { return TrivialStrategy_1.TrivialStrategy; } });
var ConsoleSender_1 = require("./Senders/ConsoleSender");
Object.defineProperty(exports, "ConsoleSender", { enumerable: true, get: function () { return ConsoleSender_1.ConsoleSender; } });
var MeteorClientHttpSender_1 = require("./Senders/MeteorClientHttpSender");
Object.defineProperty(exports, "MeteorClientHttpSender", { enumerable: true, get: function () { return MeteorClientHttpSender_1.MeteorClientHttpSender; } });
var MeteorClientMethodSender_1 = require("./Senders/MeteorClientMethodSender");
Object.defineProperty(exports, "MeteorClientMethodSender", { enumerable: true, get: function () { return MeteorClientMethodSender_1.MeteorClientMethodSender; } });
var MongodbSender_1 = require("./Senders/MongodbSender");
Object.defineProperty(exports, "MongodbSender", { enumerable: true, get: function () { return MongodbSender_1.MongodbSender; } });
/* modern-syslog is not usable on the client side, because it fails to load
 * its compiled binary dependency. It is removed by the bundler because of the
 * "browser" key in package.json.
 */
var NullSender_1 = require("./Senders/NullSender");
Object.defineProperty(exports, "NullSender", { enumerable: true, get: function () { return NullSender_1.NullSender; } });
var SenderBase_1 = require("./Senders/SenderBase");
Object.defineProperty(exports, "SenderBase", { enumerable: true, get: function () { return SenderBase_1.SenderBase; } });
var TeeSender_1 = require("./Senders/TeeSender");
Object.defineProperty(exports, "TeeSender", { enumerable: true, get: function () { return TeeSender_1.TeeSender; } });
//# sourceMappingURL=indexBrowser.js.map