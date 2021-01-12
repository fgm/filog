"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutingProcessor = void 0;
var ProcessorBase_1 = require("./ProcessorBase");
/**
 * RoutingProcessor adds route information to logs.
 *
 * @extends ProcessorBase
 */
var RoutingProcessor = /** @class */ (function (_super) {
    __extends(RoutingProcessor, _super);
    /**
     * Constructor ensures the processor is used in a browser context.
     */
    function RoutingProcessor() {
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
    RoutingProcessor.prototype.process = function (context) {
        var result = __assign(__assign({}, context), { routing: { location: window.location } });
        return result;
    };
    return RoutingProcessor;
}(ProcessorBase_1.ProcessorBase));
exports.RoutingProcessor = RoutingProcessor;
//# sourceMappingURL=RoutingProcessor.js.map