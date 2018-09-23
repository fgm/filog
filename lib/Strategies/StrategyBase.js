"use strict";
/**
 * @fileOverview Base Strategy.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var NullSender_1 = __importDefault(require("../Senders/NullSender"));
/**
 * StrategyBase is an "abstract" strategy.
 *
 * Strategies customize the active Sender instances for a given log event.
 *
 * @see SenderBase
 */
var StrategyBase = /** @class */ (function () {
    function class_1(init) {
        if (init === void 0) { init = true; }
        // @see https://github.com/Microsoft/TypeScript/issues/17293
        this.senders = [];
        if (init) {
            this.senders = [new NullSender_1.default()];
        }
    }
    class_1.prototype.selectSenders = function (_1, _2, _3) {
        return this.senders;
    };
    class_1.prototype.customizeLogger = function (_) { return; };
    return class_1;
}());
exports.default = StrategyBase;
//# sourceMappingURL=StrategyBase.js.map