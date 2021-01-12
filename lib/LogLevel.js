"use strict";
/**
 * @fileOverview
 * Package exported constants.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEBUG = exports.INFORMATIONAL = exports.INFO = exports.NOTICE = exports.WARNING = exports.ERROR = exports.CRITICAL = exports.ALERT = exports.EMERGENCY = exports.Levels = exports.Names = void 0;
var Names = [
    "Emergency",
    "Alert",
    "Critical",
    "Error",
    "Warning",
    "Notice",
    "Informational",
    "Debug",
];
exports.Names = Names;
var EMERGENCY = 0;
exports.EMERGENCY = EMERGENCY;
var ALERT = 1;
exports.ALERT = ALERT;
var CRITICAL = 2;
exports.CRITICAL = CRITICAL;
var ERROR = 3;
exports.ERROR = ERROR;
var WARNING = 4;
exports.WARNING = WARNING;
var NOTICE = 5;
exports.NOTICE = NOTICE;
var INFORMATIONAL = 6;
exports.INFORMATIONAL = INFORMATIONAL;
var INFO = 6;
exports.INFO = INFO;
var DEBUG = 7;
exports.DEBUG = DEBUG;
var Levels;
(function (Levels) {
    Levels[Levels["EMERGENCY"] = 0] = "EMERGENCY";
    Levels[Levels["ALERT"] = 1] = "ALERT";
    Levels[Levels["CRITICAL"] = 2] = "CRITICAL";
    Levels[Levels["ERROR"] = 3] = "ERROR";
    Levels[Levels["WARNING"] = 4] = "WARNING";
    Levels[Levels["NOTICE"] = 5] = "NOTICE";
    Levels[Levels["INFORMATIONAL"] = 6] = "INFORMATIONAL";
    Levels[Levels["INFO"] = 6] = "INFO";
    Levels[Levels["DEBUG"] = 7] = "DEBUG";
})(Levels || (Levels = {}));
exports.Levels = Levels;
//# sourceMappingURL=LogLevel.js.map