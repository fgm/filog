"use strict";
/**
 * @fileOverview Client-side Logger implementation.
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
var _a;
"use strict";
var Logger_1 = __importDefault(require("./Logger"));
var SIDE = "client";
/**
 * ClientLogger is the client-side implementation of Logger.
 *
 * In its current state, it brings nothing over Logger, simply providing an
 * extension-specialization point.
 *
 * @extends Logger
 *
 * @property {string} side
 */
var ClientLogger = (_a = /** @class */ (function (_super) {
        __extends(class_1, _super);
        function class_1(strategy) {
            var _this = _super.call(this, strategy) || this;
            _this.side = SIDE;
            return _this;
        }
        return class_1;
    }(Logger_1.default)),
    _a.side = SIDE,
    _a);
exports.default = ClientLogger;
//# sourceMappingURL=ClientLogger.js.map