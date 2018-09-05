"use strict";
/**
 * @fileOverview Base Logger class.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var tracekit_1 = __importDefault(require("tracekit"));
var IContext_1 = require("../IContext");
var InvalidArgumentException_1 = __importDefault(require("../InvalidArgumentException"));
var LogLevel = __importStar(require("../LogLevel"));
// const logMethodNames = ["log", "debug", "info", "warn", "error", "_exception" ];
var SIDE = "unknown";
/**
 * Logger is the base class for loggers.
 */
var Logger = /** @class */ (function () {
    /**
     * @constructor
     *
     * @param {StrategyBase} strategy
     *   The sender selection strategy to apply.
     *
     */
    function Logger(strategy) {
        this.strategy = strategy;
        this.processors = [];
        this.side = SIDE;
        this.processors = [];
        this.tk = tracekit_1.default;
        this.strategy.customizeLogger(this);
    }
    /**
     * Map a syslog level to its standard name.
     *
     * @param {Number} level
     *   An RFC5424 level.
     *
     * @returns {String}
     *   The english name for the level.
     */
    Logger.levelName = function (level) {
        var numericLevel = Math.round(level);
        if (numericLevel < LogLevel.EMERGENCY || isNaN(numericLevel)) {
            numericLevel = LogLevel.EMERGENCY;
        }
        else if (numericLevel > LogLevel.DEBUG) {
            numericLevel = LogLevel.DEBUG;
        }
        return LogLevel.Names[numericLevel];
    };
    /**
     * Add a timestamp to a context object on the active side.
     *
     * Ensure a TS_KEY will be present, and existing timestamps are not being
     * overwritten, except possibly for any value already present at [TS_KEY][op].
     *
     * @param context
     *   Mutated. The context to stamp.
     * @param op
     *   The operation for which to add a timestamp.
     *
     * @protected
     */
    Logger.stamp = function (context, op, side) {
        var now = +new Date();
        // Ensure context actually contains a TS_KEY.
        if (typeof context[IContext_1.TS_KEY] === "undefined") {
            context[IContext_1.TS_KEY] = {};
        }
        // We know context[TS_KEY] is defined because we just ensured it was.
        var contextTs = context[IContext_1.TS_KEY];
        var sideTs = contextTs[side] || {};
        sideTs[op] = now;
        contextTs[side] = sideTs;
    };
    /**
     * Arm the report subscriber.
     *
     * @returns {void}
     *
     * @see Logger#reportSubscriber
     */
    Logger.prototype.arm = function () {
        this.tk.report.subscribe(this.reportSubscriber.bind(this));
    };
    /** @inheritDoc */
    Logger.prototype.debug = function (message, context) {
        if (context === void 0) { context = {}; }
        this.log(LogLevel.DEBUG, message, context);
    };
    /**
     * Disarm the subscriber.
     *
     * In most cases, we do not want to disarm immediately: a stack trace being
     * build may take several hundred milliseconds, and we would lose it.
     *
     * @param {Number} delay
     *   The delay before actually disarming, in milliseconds.
     *
     * @returns {void}
     */
    Logger.prototype.disarm = function (delay) {
        var _this = this;
        if (delay === void 0) { delay = 2000; }
        setTimeout(function () {
            _this.tk.report.unsubscribe(_this.reportSubscriber);
        }, delay);
    };
    /** @inheritDoc */
    Logger.prototype.error = function (message, context) {
        if (context === void 0) { context = {}; }
        // FIXME: message may not be a string.
        this.log(LogLevel.ERROR, message, context);
    };
    /**
     * Provide the default context bits specific to the logger instance + details.
     *
     * @param details
     *   The message details.
     *
     * This method is only made public for the benefit of tests: it is not meant
     * to be used outside the class and its tests.
     *
     * @protected
     */
    Logger.prototype.getInitialContext = function (details) {
        if (details === void 0) { details = {}; }
        var _a;
        var cx = (_a = {},
            _a[IContext_1.DETAILS_KEY] = details,
            _a[IContext_1.SOURCE_KEY] = this.side,
            _a);
        var hostName = this._getHostname();
        if (typeof hostName === "string") {
            cx[IContext_1.HOST_KEY] = hostName;
        }
        Logger.stamp(cx, "log", this.side);
        return cx;
    };
    /** @inheritDoc */
    Logger.prototype.info = function (message, context) {
        if (context === void 0) { context = {}; }
        this.log(LogLevel.INFORMATIONAL, message, context);
    };
    /** @inheritDoc */
    Logger.prototype.log = function (level, message, details) {
        if (details === void 0) { details = {}; }
        this.validateLevel(level);
        var c1 = this.getInitialContext(details);
        this.send(this.strategy, level, String(message), c1);
    };
    /**
     * The callback invoked by TraceKit
     *
     * @param e
     *   Error on which to report.
     */
    Logger.prototype.report = function (e) {
        this.tk.report(e);
    };
    /**
     * Error-catching callback when the logger is arm()-ed.
     *
     * @param e
     *   The error condition to log.
     *
     * @see Logger#arm
     */
    Logger.prototype.reportSubscriber = function (e) {
        this.log(LogLevel.ERROR, e.message, { error: e });
    };
    /**
     * Actually send a message with a processed context using a strategy.
     *
     * @see Logger.log()
     * @protected
     *
     * @param strategy
     *   The sending strategy.
     * @param level
     *   An RFC5424 level.
     * @param message
     *   The message template.
     * @param sentContext
     *   A message context, possibly including a message_details key to separate
     *   data passed to the log() call from data added by processors.
     *
     * @returns {void}
     */
    Logger.prototype.send = function (strategy, level, message, sentContext) {
        var senders = strategy.selectSenders(level, message, sentContext);
        senders.forEach(function (sender) {
            sender.send(level, message, sentContext);
        });
    };
    /**
     * Ensure a log level is in the allowed value set.
     *
     * While this is useless for TS code, JS code using the compiled version of
     * the module still needs that check.
     *
     * @see Logger.log()
     *
     * @param {Number} requestedLevel
     *   A RFC5424 level.
     *
     * @throws InvalidArgumentException
     *   As per PSR-3, if level is not a valid RFC5424 level.
     */
    Logger.prototype.validateLevel = function (requestedLevel) {
        if (!Number.isInteger(requestedLevel)
            || +requestedLevel < LogLevel.EMERGENCY
            || +requestedLevel > LogLevel.DEBUG) {
            throw new InvalidArgumentException_1.default("The level argument to log() must be an RFC5424 level.");
        }
    };
    /** @inheritDoc */
    Logger.prototype.warn = function (message, context) {
        if (context === void 0) { context = {}; }
        this.log(LogLevel.WARNING, message, context);
    };
    /**
     * Implements the standard Meteor logger methods.
     *
     * This method is an implementation detail: do not depend on it.
     *
     * @param {String} level
     *   debug, info, warn, or error
     *
     * @todo (or not ?) merge in the funky Meteor logic from the logging package.
     */
    Logger.prototype._meteorLog = function () { return; };
    /**
     * Child classes are expected to re-implement this.
     *
     * @protected
     */
    Logger.prototype._getHostname = function () {
        return undefined;
    };
    Logger.METHOD = "filog:log";
    Logger.side = SIDE;
    return Logger;
}());
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map