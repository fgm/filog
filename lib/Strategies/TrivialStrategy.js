"use strict";
/**
 * @fileOverview Trivial Strategy.
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var StrategyBase_1 = __importDefault(require("./StrategyBase"));
/**
 * This strategy uses a single sender for all configurations.
 *
 * As such, it is mostly meant for tests.
 *
 * @extends StrategyBase
 */
var TrivialStrategy = /** @class */ (function (_super) {
    __extends(class_1, _super);
    // noinspection JSClassNamingConvention
    /**
     * @constructor
     *
     * @param {function} sender
     *   The Sender to use for all events
     */
    function class_1(sender) {
        var _this = _super.call(this, false) || this;
        _this.senders = [sender];
        return _this;
    }
    return class_1;
}(StrategyBase_1.default));
exports.default = TrivialStrategy;
//# sourceMappingURL=TrivialStrategy.js.map