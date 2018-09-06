"use strict";
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
var IContext_1 = require("../IContext");
var Logger_1 = require("../Loggers/Logger");
var ServerLogger_1 = require("../Loggers/ServerLogger");
/**
 * MongodbSender sends logs to the Meteor standard database.
 */
var MongodbSender = /** @class */ (function () {
    // noinspection JSClassNamingConvention
    /**
     * @constructor
     *
     * @param mongo
     *   The Meteor Mongo service.
     * @param collection
     *   The collection or the name of the collection in which to log.
     */
    function MongodbSender(mongo, collection) {
        if (collection === void 0) { collection = "logger"; }
        if (collection instanceof mongo.Collection) {
            this.store = collection;
        }
        else if (typeof collection === "string") {
            this.store = new mongo.Collection(collection);
        }
        else {
            throw new Error("MongodbSender requires a Collection or a collection name");
        }
    }
    /** @inheritDoc */
    MongodbSender.prototype.send = function (level, message, context) {
        var defaultedContext = __assign({}, context, { timestamp: {} });
        var doc = { level: level, message: message, context: {} };
        // It should contain a timestamp.{side} object if it comes from any Logger.
        if (typeof defaultedContext[IContext_1.KEY_TS] === "undefined") {
            defaultedContext[IContext_1.KEY_TS] = {
                server: {},
            };
        }
        doc.context = defaultedContext;
        // doc.context.timestamp.server is known to exist from above.
        Logger_1.Logger.stamp(doc.context, "send", ServerLogger_1.ServerSide);
        this.store.insert(doc);
    };
    return MongodbSender;
}());
exports.MongodbSender = MongodbSender;
//# sourceMappingURL=MongodbSender.js.map