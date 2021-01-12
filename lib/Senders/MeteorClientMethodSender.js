"use strict";
/** global: Meteor */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeteorClientMethodSender = void 0;
/**
 * @fileOverview Meteor Client Method Sender class.
 */
var Logger_1 = require("../Loggers/Logger");
/**
 * MeteorClientMethodSender send data from the client to the server over DDP.
 */
var MeteorClientMethodSender = /** @class */ (function () {
    function MeteorClientMethodSender() {
        if (typeof Meteor === "undefined" || !Meteor.isClient) {
            throw new Error("MeteorClientMethodSender is only meant for Meteor client side.");
        }
    }
    /** @inheritDoc */
    MeteorClientMethodSender.prototype.send = function (level, message, context) {
        var data = { level: level, message: message, context: {} };
        if (typeof context !== "undefined") {
            data.context = context;
        }
        Meteor.call(Logger_1.Logger.METHOD, data);
    };
    return MeteorClientMethodSender;
}());
exports.MeteorClientMethodSender = MeteorClientMethodSender;
//# sourceMappingURL=MeteorClientMethodSender.js.map