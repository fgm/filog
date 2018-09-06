"use strict";
/** global: HTTP, Meteor */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @fileOverview Meteor Client HTTP Sender class.
 */
var NullFn_1 = __importDefault(require("../NullFn"));
/**
 * MeteorClientHttpSender send data from the client to the server over HTTP.
 */
var MeteorClientHttpSender = /** @class */ (function () {
    // noinspection JSClassNamingConvention
    /**
     * @constructor
     *
     * @param {String} loggerUrl
     *   The absolute URL of the logger server. Usually /logger on the Meteor app.
     */
    function MeteorClientHttpSender(loggerUrl) {
        this.loggerUrl = loggerUrl;
        if (typeof Meteor === "undefined" || !Meteor.isClient) {
            throw new Error("MeteorClientHttpSender is only meant for Meteor client side.");
        }
        if (typeof HTTP === "undefined") {
            throw new Error("MeteorClientHttpSender needs the Meteor http package to be active.");
        }
        this.http = HTTP;
        this.requestHeaders = {
            "Content-Type": "application/json",
        };
    }
    /** @inheritDoc */
    MeteorClientHttpSender.prototype.send = function (level, message, context) {
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
    return MeteorClientHttpSender;
}());
exports.MeteorClientHttpSender = MeteorClientHttpSender;
//# sourceMappingURL=MeteorClientHttpSender.js.map