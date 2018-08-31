"use strict";
/**
 * @fileOverview Console Sender class.
 *
 * Because this file is about actually using the console, it has to disable the
 * no-console rule.
 */
/* tslint:disable:no-console */
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
var SenderBase_1 = __importDefault(require("./SenderBase"));
/**
 * ConsoleSender sends the log events it receives to the browser console.
 *
 * @extends SenderBase
 */
var ConsoleSender = /** @class */ (function (_super) {
    __extends(class_1, _super);
    function class_1() {
        var _this = _super.call(this) || this;
        if (!console) {
            throw new Error("Console sender needs a console object.");
        }
        return _this;
    }
    /** @inheritDoc */
    class_1.prototype.send = function (level, message, context) {
        var methods = [
            console.error,
            console.error,
            console.error,
            console.error,
            console.warn,
            console.warn,
            console.info,
            console.log,
        ];
        var method = methods[level].bind(console);
        method(LogLevel.Names[level], message, context);
    };
    return class_1;
}(SenderBase_1.default));
exports.default = ConsoleSender;
//# sourceMappingURL=ConsoleSender.js.map