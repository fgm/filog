"use strict";
/** global: Meteor */
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
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @fileOverview Meteor Client Method Sender class.
 */
var Logger_1 = require("../Loggers/Logger");
var SenderBase_1 = require("./SenderBase");
/**
 * MeteorClientMethodSender send data from the client to the server over DDP.
 *
 * @extends SenderBase
 */
var MeteorClientMethodSender = /** @class */ (function (_super) {
    __extends(class_1, _super);
    /**
     * @constructor
     *
     * @param {String} loggerUrl
     *   The absolute URL of the logger server. Usually /logger on the Meteor app.
     */
    function class_1() {
        var _this = _super.call(this) || this;
        if (typeof Meteor === "undefined" || !Meteor.isClient) {
            throw new Error("MeteorClientMethodSender is only meant for Meteor client side.");
        }
        return _this;
    }
    /** @inheritDoc */
    class_1.prototype.send = function (level, message, context) {
        var data = { level: level, message: message, context: {} };
        if (typeof context !== "undefined") {
            data.context = context;
        }
        Meteor.call(Logger_1.Logger.METHOD, data);
    };
    return class_1;
}(SenderBase_1.SenderBase));
exports.default = MeteorClientMethodSender;
//# sourceMappingURL=MeteorClientMethodSender.js.map