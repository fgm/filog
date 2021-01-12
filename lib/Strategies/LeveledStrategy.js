"use strict";
/**
 * @fileOverview Level-based Strategy.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeveledStrategy = void 0;
var LogLevel = __importStar(require("../LogLevel"));
var NullFn_1 = __importDefault(require("../NullFn"));
var NullSender_1 = require("../Senders/NullSender");
var StrategyBase_1 = require("./StrategyBase");
/**
 * LeveledStrategy defines a single sender per level.
 *
 * @extends StrategyBase
 */
var LeveledStrategy = /** @class */ (function (_super) {
    __extends(LeveledStrategy, _super);
    // noinspection JSClassNamingConvention
    /**
     * @constructor
     *
     * @param {function} low
     *   The Sender to use for low-interest events.
     * @param {function} medium
     *   The Sender to use for medium-interest events.
     * @param {function} high
     *   The Sender to use for high-interest events.
     * @param {int} minLow
     *   The minimum level to handle as a low-interest event.
     * @param {int} maxHigh
     *   The maximum level to handle as a high-interest event.
     */
    function LeveledStrategy(low, medium, high, minLow, maxHigh) {
        if (minLow === void 0) { minLow = LogLevel.DEBUG; }
        if (maxHigh === void 0) { maxHigh = LogLevel.WARNING; }
        var _this = 
        // Do not initialize a default null sender.
        _super.call(this, false) || this;
        _this.low = low;
        _this.medium = medium;
        _this.high = high;
        _this.minLow = minLow;
        _this.maxHigh = maxHigh;
        _this.senders = [low, medium, high];
        _this.senders.forEach(function (sender) {
            // Not really an "implements ISender" check, but cheaper and more useful.
            if (!sender.send) {
                throw new Error("LeveledStrategy: senders must implement the ISender \"send()\" method.");
            }
        });
        return _this;
    }
    /** @inheritDoc */
    LeveledStrategy.prototype.customizeLogger = function (logger) {
        var _this = this;
        ["low", "medium", "high"].forEach(function (level) {
            if (_this[level] instanceof NullSender_1.NullSender) {
                logger.debug = NullFn_1.default;
            }
        });
    };
    LeveledStrategy.prototype.selectSenders = function (level, _2, _3) {
        var sender;
        if (level >= this.minLow) {
            sender = this.low;
        }
        else if (level <= this.maxHigh) {
            sender = this.high;
        }
        else {
            sender = this.medium;
        }
        return [sender];
    };
    return LeveledStrategy;
}(StrategyBase_1.StrategyBase));
exports.LeveledStrategy = LeveledStrategy;
//# sourceMappingURL=LeveledStrategy.js.map