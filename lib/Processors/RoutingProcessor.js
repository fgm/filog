"use strict";
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
var ProcessorBase_1 = __importDefault(require("./ProcessorBase"));
/**
 * RoutingProcessor adds route information to logs.
 *
 * @extends ProcessorBase
 */
var RoutingProcessor = /** @class */ (function (_super) {
    __extends(class_1, _super);
    /**
     * Constructor ensures the processor is used in a browser context.
     */
    function class_1() {
        var _this = _super.call(this) || this;
        if (!window || !window.location) {
            throw new Error("Cannot provide route information without location information.");
        }
        return _this;
    }
    /**
     * Overwrite any previous routing information in context.
     *
     * @param {object} context
     *   The context object for a log event.
     *
     * @returns {object}
     *   The processed context object.
     */
    class_1.prototype.process = function (context) {
        var result = Object.assign({}, context, { routing: { location: window.location } });
        return result;
    };
    return class_1;
}(ProcessorBase_1.default));
exports.default = RoutingProcessor;
//# sourceMappingURL=RoutingProcessor.js.map