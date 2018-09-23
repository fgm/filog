"use strict";
/**
 * @fileOverview Level-based Strategy.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var LogLevel = __importStar(require("../LogLevel"));
var NullFn_1 = __importDefault(require("../NullFn"));
var NullSender_1 = __importDefault(require("../Senders/NullSender"));
var SenderBase_1 = __importDefault(require("../Senders/SenderBase"));
var StrategyBase_1 = __importDefault(require("./StrategyBase"));
/**
 * LeveledStrategy defines a single sender per level.
 *
 * @extends StrategyBase
 */
var LeveledStrategy = /** @class */ (function (_super) {
    __extends(class_1, _super);
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
    function class_1(low, medium, high, minLow, maxHigh) {
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
            if (!(sender instanceof SenderBase_1.default)) {
                throw new Error("LeveledStrategy: senders must be instances of a Sender class.");
            }
        });
        return _this;
    }
    class_1.prototype.customizeLogger = function (logger) {
        var _this = this;
        ["low", "medium", "high"].forEach(function (level) {
            if (_this[level] instanceof NullSender_1.default) {
                logger.debug = NullFn_1.default;
            }
        });
    };
    class_1.prototype.selectSenders = function (level, _2, _3) {
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
    return class_1;
}(StrategyBase_1.default));
exports.default = LeveledStrategy;
//# sourceMappingURL=LeveledStrategy.js.map