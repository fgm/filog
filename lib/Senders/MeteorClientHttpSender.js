"use strict";
/** global: HTTP, Meteor */
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
/**
 * @fileOverview Meteor Client HTTP Sender class.
 */
var NullFn_1 = __importDefault(require("../NullFn"));
var SenderBase_1 = __importDefault(require("./SenderBase"));
/**
 * MeteorClientHttpSender send data from the client to the server over HTTP.
 *
 * @extends SenderBase
 */
var MeteorClientHttpSender = /** @class */ (function (_super) {
    __extends(class_1, _super);
    // noinspection JSClassNamingConvention
    /**
     * @constructor
     *
     * @param {String} loggerUrl
     *   The absolute URL of the logger server. Usually /logger on the Meteor app.
     */
    function class_1(loggerUrl) {
        var _this = _super.call(this) || this;
        _this.loggerUrl = loggerUrl;
        if (typeof Meteor === "undefined" || !Meteor.isClient) {
            throw new Error("MeteorClientHttpSender is only meant for Meteor client side.");
        }
        if (typeof HTTP === "undefined") {
            throw new Error("MeteorClientHttpSender needs the Meteor http package to be active.");
        }
        _this.http = HTTP;
        _this.requestHeaders = {
            "Content-Type": "application/json",
        };
        return _this;
    }
    /** @inheritDoc */
    class_1.prototype.send = function (level, message, context) {
        var data = { level: level, message: message, context: {} };
        if (typeof context !== "undefined") {
            data.context = context;
        }
        var options = {
            data: data,
            headers: this.requestHeaders,
        };
        this.http.post(this.loggerUrl, options, NullFn_1.default);
    };
    return class_1;
}(SenderBase_1.default));
exports.default = MeteorClientHttpSender;
//# sourceMappingURL=MeteorClientHttpSender.js.map