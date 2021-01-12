"use strict";
/**
 * @fileOverview Syslog Sender class.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyslogSender = void 0;
var modernSyslog = require("modern-syslog");
var path = __importStar(require("path"));
var util = __importStar(require("util"));
var IContext_1 = require("../IContext");
var Logger_1 = require("../Loggers/Logger");
var ServerLogger_1 = require("../Loggers/ServerLogger");
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
 */
var SyslogSender = /** @class */ (function () {
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
    function SyslogSender(ident, syslogOptions, syslogFacility, syslog, // modernSyslog,
    formatOptions, serialize) {
        if (ident === void 0) { ident = null; }
        if (syslogOptions === void 0) { syslogOptions = 0; }
        if (syslogFacility === void 0) { syslogFacility = null; }
        if (serialize === void 0) { serialize = null; }
        this.syslog = syslog;
        var programName = path.basename(process.argv[1]);
        var actualIdent = ident || programName;
        this.syslog = syslog || modernSyslog;
        this.facility = syslogFacility || this.syslog.facility.LOG_LOCAL0;
        this.ident = actualIdent;
        this.option = syslogOptions !== null
            ? syslogOptions
            : (this.syslog.option.LOG_PID);
        this.formatOptions = formatOptions || { depth: 5 };
        this.serialize = serialize || this.serializeDefault.bind(this);
        this.syslog.open(this.ident, this.option, this.facility);
    }
    /**
     * @inheritDoc
     */
    SyslogSender.prototype.send = function (level, message, context) {
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
            doc.context = (_a = {}, _a[IContext_1.KEY_TS] = { server: {} }, _a);
        }
        else if (typeof doc.context[IContext_1.KEY_TS] === "undefined") {
            doc.context[IContext_1.KEY_TS] = {};
        }
        // doc.context.timestamp.server is known to exist from above.
        Logger_1.Logger.stamp(doc.context, "send", ServerLogger_1.ServerSide);
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
    SyslogSender.prototype.serializeDefault = function (doc) {
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
            // Since doc is a SyslogContext, doc.message is a string, no need to test.
            step1.message = doc.message;
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
    SyslogSender.prototype.serializeInspect = function (doc) {
        return util.inspect(doc, this.formatOptions);
    };
    return SyslogSender;
}());
exports.SyslogSender = SyslogSender;
//# sourceMappingURL=SyslogSender.js.map