"use strict";
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
exports.BrowserProcessor = void 0;
var ProcessorBase_1 = require("./ProcessorBase");
/**
 * Adds browser related information to an event context.
 *
 * - plugins, platform, product, userAgent
 * - memory information
 *
 * @extends ProcessorBase
 */
var BrowserProcessor = /** @class */ (function (_super) {
    __extends(BrowserProcessor, _super);
    /**
     * ProcessorBase ensures it is not being built outside a browser.
     *
     * @param {object} nav
     *   window.Navigator.
     * @param {object} win
     *   window.
     */
    function BrowserProcessor(nav, win) {
        var _this = _super.call(this) || this;
        var actualNav = nav || (typeof navigator === "object" && navigator);
        var actualWin = win || (typeof window === "object" && window);
        if (typeof actualNav !== "object" || typeof actualWin !== "object" || !actualNav || !actualWin) {
            throw new ReferenceError("BrowserProcessor is only usable on browser-run code.");
        }
        _this.navigator = actualNav;
        _this.window = actualWin;
        return _this;
    }
    /** @inheritDoc */
    BrowserProcessor.prototype.process = function (context) {
        var unknown = "unknown";
        var browserDefaults = {
            platform: unknown,
            userAgent: unknown,
        };
        // Ensure a browser key exists, using the contents from context if available.
        var result = __assign({ browser: __assign({ performance: this.window.performance }, browserDefaults) }, context);
        // Overwrite existing browser keys in context, keeping non-overwritten ones.
        for (var key in browserDefaults) {
            if (browserDefaults.hasOwnProperty(key)) {
                result.browser[key] = this.navigator[key]
                    ? this.navigator[key]
                    : browserDefaults[key];
            }
        }
        result.browser.performance = (this.window.performance && this.window.performance.memory)
            ? {
                memory: {
                    jsHeapSizeLimit: this.window.performance.memory.jsHeapSizeLimit,
                    totalJSHeapSize: this.window.performance.memory.totalJSHeapSize,
                    usedJSHeapSize: this.window.performance.memory.usedJSHeapSize,
                },
            }
            : {};
        return result;
    };
    return BrowserProcessor;
}(ProcessorBase_1.ProcessorBase));
exports.BrowserProcessor = BrowserProcessor;
//# sourceMappingURL=BrowserProcessor.js.map