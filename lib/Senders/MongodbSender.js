"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var IContext_1 = require("../IContext");
var Logger_1 = __importDefault(require("../Logger"));
var ServerLogger_1 = __importDefault(require("../ServerLogger"));
var SenderBase_1 = __importDefault(require("./SenderBase"));
/**
 * MongodbSender sends logs to the Meteor standard database.
 *
 * @extends SenderBase
 */
var MongodbSender = /** @class */ (function (_super) {
    __extends(class_1, _super);
    // noinspection JSClassNamingConvention
    /**
     * @constructor
     *
     * @param {Mongo} mongo
     *   The Meteor Mongo service.
     * @param {(String|Collection)} collection
     *   The collection or the name of the collection in which to log.
     */
    function class_1(mongo, collection) {
        if (collection === void 0) { collection = "logger"; }
        var _this = _super.call(this) || this;
        if (collection instanceof mongo.Collection) {
            _this.store = collection;
        }
        else if (typeof collection === "string") {
            var collectionName = collection;
            _this.store = new mongo.Collection(collectionName);
        }
        else {
            throw new Error("MongodbSender requires a Collection or a collection name");
        }
        return _this;
    }
    /** @inheritDoc */
    class_1.prototype.send = function (level, message, context) {
        var defaultedContext = __assign({}, context, { timestamp: {} });
        var doc = { level: level, message: message, context: {} };
        // It should contain a timestamp.{side} object if it comes from any Logger.
        if (typeof defaultedContext[IContext_1.TS_KEY] === "undefined") {
            defaultedContext[IContext_1.TS_KEY] = {
                server: {},
            };
        }
        doc.context = defaultedContext;
        // doc.context.timestamp.server is known to exist from above.
        Logger_1.default.prototype.stamp.call({ side: ServerLogger_1.default.side }, doc.context, "send");
        this.store.insert(doc);
    };
    return class_1;
}(SenderBase_1.default));
exports.default = MongodbSender;
//# sourceMappingURL=MongodbSender.js.map