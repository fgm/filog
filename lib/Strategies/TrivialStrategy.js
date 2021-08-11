"use strict";
/**
 * @fileOverview Trivial Strategy.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrivialStrategy = void 0;
var StrategyBase_1 = require("./StrategyBase");
/**
 * This strategy uses a single sender for all configurations.
 *
 * As such, it is mostly meant for tests.
 *
 * @extends StrategyBase
 */
var TrivialStrategy = /** @class */ (function (_super) {
    __extends(TrivialStrategy, _super);
    // noinspection JSClassNamingConvention
    /**
     * @constructor
     *
     * @param {function} sender
     *   The Sender to use for all events
     */
    function TrivialStrategy(sender) {
        var _this = _super.call(this, false) || this;
        _this.senders = [sender];
        return _this;
    }
    return TrivialStrategy;
}(StrategyBase_1.StrategyBase));
exports.TrivialStrategy = TrivialStrategy;
//# sourceMappingURL=TrivialStrategy.js.map