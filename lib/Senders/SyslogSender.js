"use strict";
/**
 * @fileOverview Syslog Sender class.
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var modernSyslog = require("modern-syslog");
var path = __importStar(require("path"));
var util = __importStar(require("util"));
var IContext_1 = require("../IContext");
var Logger_1 = require("../Loggers/Logger");
var ServerLogger_1 = require("../Loggers/ServerLogger");
var SenderBase_1 = require("./SenderBase");
/**
 * SyslogSender sends messages to a syslog server.
 *
 * It does not check the length of the message, which is limited do 1kB in
 * legacy RFC3164 syslog implementations, and could be limited to 2kB in
 * RFC5424 and/or RFC6587 implementations.
 *
 * @see https://tools.ietf.org/html/rfc3164#section-4.1
 * @see https://tools.ietf.org/html/rfc5424#section-6.1
 * @see https://tools.ietf.org/html/rfc6587#section-3.4.1
 *
 * @extends SenderBase
 */
var SyslogSender = /** @class */ (function (_super) {
    __extends(class_1, _super);
    // noinspection JSClassNamingConvention
    /**
     * @constructor
     *
     * @param ident
     *   Optional: the syslog identifier. Used as a prefix on messages.
     * @param syslogOptions
     *   Optional: a bit-level OR of syslog.LOG* option constants.
     * @param syslogFacility
     *   Optional: one of the standard RFC5424 facilities.
     * @param syslog
     *   The modern-syslog service or a compatible alternative.
     * @param formatOptions
     *   Optional : The options used to format the message. The contents depends
     *   on the serializer used. Defaults to { depth: 5 }), for the legacy
     *   "util.inspect" serializer, now available as serializeInspect().
     * @param serialize
     *   Optional: a serializer function converting a document to a string.
     *
     * @see serializeDefault
     * @see modern-syslog/core.cc
     */
    function class_1(ident, syslogOptions, syslogFacility, syslog, //modernSyslog,
    formatOptions, serialize) {
        if (ident === void 0) { ident = null; }
        if (syslogOptions === void 0) { syslogOptions = 0; }
        if (syslogFacility === void 0) { syslogFacility = null; }
        if (formatOptions === void 0) { formatOptions = null; }
        if (serialize === void 0) { serialize = null; }
        var _this = _super.call(this) || this;
        _this.syslog = syslog;
        var programName = path.basename(process.argv[1]);
        var actualIdent = ident || programName;
        _this.syslog = syslog || modernSyslog;
        _this.facility = syslogFacility || _this.syslog.facility.LOG_LOCAL0;
        _this.ident = actualIdent;
        _this.option = syslogOptions || (_this.syslog.option.LOG_PID);
        _this.formatOptions = formatOptions || { depth: 5 };
        _this.serialize = serialize || _this.serializeDefault.bind(_this);
        _this.syslog.open(_this.ident, _this.option, _this.facility);
        return _this;
    }
    /**
     * @inheritDoc
     */
    class_1.prototype.send = function (level, message, context) {
        var _a;
        var doc = {
            facility: this.syslog.facility[this.facility],
            level: this.syslog.level[level],
            message: message,
        };
        if (typeof context !== "undefined") {
            doc.context = context;
        }
        // It should contain a timestamp.{side} object if it comes from any Logger.
        if (typeof doc.context === "undefined") {
            doc.context = (_a = {}, _a[IContext_1.TS_KEY] = { server: {} }, _a);
        }
        else if (typeof doc.context[IContext_1.TS_KEY] === "undefined") {
            doc.context[IContext_1.TS_KEY] = {};
        }
        // doc.context.timestamp.server is known to exist from above.
        Logger_1.Logger.stamp(doc.context, "send", ServerLogger_1.ServerLogger.side);
        this.syslog.log(level, this.serialize(doc));
    };
    /**
     * Serialize a message to JSON. Handles circular documents with a fallback.
     *
     * @param doc
     * - an object with 3 mandatory keys and an optional one:
     *   - message: a string or object, as per Meteor Log package
     *   - level: a numeric severity level, like modernSyslog.level.LOG_DEBUG
     *   - facility: a syslog facility, like modernSyslog.facility.LOG_LOCAL0
     *   - (Optional) context: an object of context values. Anything goes.
     *
     * @returns
     *   The serialized version of the doc argument under the formatOptions rules.
     */
    class_1.prototype.serializeDefault = function (doc) {
        var result;
        try {
            result = JSON.stringify(doc);
        }
        catch (e1) {
            var step1 = {
                facility: doc.facility || this.syslog.facility.LOG_LOCAL0,
                level: doc.level,
                logger_error: "Cannot JSON.stringify logged data: " + e1.message + ".",
                raw: util.inspect(doc, this.formatOptions),
            };
            if (typeof doc.message === "string") {
                step1.message = doc.message;
            }
            try {
                result = JSON.stringify(step1);
            }
            catch (e2) {
                // Critical problem: remove moving parts.
                // RFC 5424: level 3 = error, facility 14 == log alert.
                // eslint-disable-next-line quotes
                result = '{ "level":3, "facility":14, "error":"Serialization fallback error" }';
            }
        }
        return result;
    };
    /**
     * Serialize a message to Node.js util.inspect format.
     *
     * @param doc
     *   A document to serialize. Any structure.
     *
     * @returns
     *   The serialized version of the doc argument under the formatOptions rules.
     */
    class_1.prototype.serializeInspect = function (doc) {
        var result = util.inspect(doc, this.formatOptions);
        return result;
    };
    return class_1;
}(SenderBase_1.SenderBase));
exports.default = SyslogSender;
//# sourceMappingURL=SyslogSender.js.map