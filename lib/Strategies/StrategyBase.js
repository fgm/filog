"use strict";
/**
 * @fileOverview Base Strategy.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrategyBase = void 0;
var NullSender_1 = require("../Senders/NullSender");
/**
 * StrategyBase is an "abstract" strategy.
 *
 * Strategies customize the active Sender instances for a given log event.
 */
var StrategyBase = /** @class */ (function () {
    function StrategyBase(init) {
        if (init === void 0) { init = true; }
        // @see https://github.com/Microsoft/TypeScript/issues/17293
        this.senders = [];
        if (init) {
            this.senders = [new NullSender_1.NullSender()];
        }
    }
    /** @inheritDoc */
    StrategyBase.prototype.selectSenders = function (_1, _2, _3) {
        return this.senders;
    };
    /** @inheritDoc */
    StrategyBase.prototype.customizeLogger = function (_) { return; };
    return StrategyBase;
}());
exports.StrategyBase = StrategyBase;
//# sourceMappingURL=StrategyBase.js.map