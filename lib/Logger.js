"use strict";
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
/**
 * @fileOverview Base Logger class.
 */
var tracekit_1 = __importDefault(require("tracekit"));
var IContext_1 = require("./IContext");
var InvalidArgumentException_1 = __importDefault(require("./InvalidArgumentException"));
var LogLevel = __importStar(require("./LogLevel"));
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
     * Arm the report subscriber.
     *
     * @returns {void}
     *
     * @see Logger#reportSubscriber
     */
    Logger.prototype.arm = function () {
        this.tk.report.subscribe(this.reportSubscriber.bind(this));
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
     * Add a timestamp to a context object on the active side.
     *
     * @param context
     *   Mutated. The context to stamp.
     * @param op
     *   The operation for which to add a timestamp.
     */
    Logger.prototype.stamp = function (context, op) {
        var now = +new Date();
        if (!context[IContext_1.TS_KEY]) {
            context[IContext_1.TS_KEY] = {};
        }
        var contextTs = context[IContext_1.TS_KEY];
        var side = contextTs[this.side] || {};
        side[op] = now;
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
    /** @inheritDoc */
    Logger.prototype.info = function (message, context) {
        if (context === void 0) { context = {}; }
        this.log(LogLevel.INFORMATIONAL, message, context);
    };
    /** @inheritDoc */
    Logger.prototype.log = function (level, message, initialContext, process) {
        if (initialContext === void 0) { initialContext = {}; }
        if (process === void 0) { process = true; }
        this.send(this.strategy, level, String(message), initialContext);
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
    Logger.METHOD = "filog:log";
    Logger.side = SIDE;
    return Logger;
}());
exports.default = Logger;
//# sourceMappingURL=Logger.js.map