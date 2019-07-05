"use strict";
/**
 * @fileOverview Console Sender class.
 *
 * Because this file is about actually using the console, it has to disable the
 * no-console rule.
 */
/* tslint:disable:no-console */
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var LogLevel = __importStar(require("../LogLevel"));
/**
 * ConsoleSender sends the log events it receives to the browser console.
 */
var ConsoleSender = /** @class */ (function () {
    function ConsoleSender() {
        // Checking "if (!(console instanceof Console)" compiles, but fails to
        // execute during tests, which run in Node.JS in which Console is not a type
        // but only the name of the console constructor. Since checking
        // console.constructor.name is liable to fail in minified code, we need a
        // weaker check.
        if (typeof console === "undefined" || console === null || typeof console !== "object") {
            throw new Error("Console sender needs a console object.");
        }
        ["log", "info", "warn", "error"].forEach(function (method) {
            if (typeof console[method] === "undefined") {
                throw new Error("Console is missing method " + method + ".");
            }
            if (console[method].constructor.name !== "Function") {
                throw new Error("Console property method " + method + " is not a function.");
            }
        });
    }
    /** @inheritDoc */
    ConsoleSender.prototype.send = function (level, message, context) {
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
    return ConsoleSender;
}());
exports.ConsoleSender = ConsoleSender;
//# sourceMappingURL=ConsoleSender.js.map