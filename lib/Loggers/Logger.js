"use strict";
/**
 * @fileOverview Base Logger class.
 */
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
var util = __importStar(require("util"));
var tracekit_1 = __importDefault(require("tracekit"));
var IContext_1 = require("../IContext");
var InvalidArgumentException_1 = __importDefault(require("../InvalidArgumentException"));
var LogLevel = __importStar(require("../LogLevel"));
// const logMethodNames = ["log", "debug", "info", "warn", "error", "_exception" ];
var MESSAGE_MAX_LENGTH = 8192;
var SIDE = "unknown_side";
var SNIP_MARKER = "[…]";
/**
 * Logger is the base class for loggers.
 */
var Logger = /** @class */ (function () {
    /**
     * @constructor
     *
     * @param strategy
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
     * @param level
     *   An RFC5424 level.
     *
     * @returns
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
     * Module-private processor reducer.
     *
     * @see Logger.process
     *
     * @internal
     * @protected
     */
    Logger.processorReducer = function (accu, processor) {
        return processor.process(accu);
    };
    /**
     * Add a timestamp to a context object on the active side.
     *
     * Ensure a KEY_TS will be present, and existing timestamps are not being
     * overwritten, except possibly for any value already present at [KEY_TS][op].
     *
     * @param context
     *   Mutated. The context to stamp.
     * @param op
     *   The operation for which to add a timestamp.
     * @param side
     *   The side on which the operation is to be logged.
     *
     * @protected
     */
    Logger.stamp = function (context, op, side) {
        var now = +new Date();
        // Ensure context actually contains a KEY_TS.
        if (typeof context[IContext_1.KEY_TS] === "undefined") {
            context[IContext_1.KEY_TS] = {};
        }
        // We know context[KEY_TS] is defined because we just ensured it was.
        var contextTs = context[IContext_1.KEY_TS];
        var sideTs = contextTs[side] || {};
        sideTs[op] = now;
        contextTs[side] = sideTs;
    };
    /**
     * Return a plain message string from any shape of document.
     *
     * @param doc
     *   Expect it to be an object with a "message" key with a string value, but
     *   accept anything.
     *
     * @returns
     *   A string, as close to the string representation of doc.message as
     *   feasible.
     */
    Logger.stringifyMessage = function (doc) {
        var customStringify = function (input) {
            if (typeof input === "undefined") {
                return null;
            }
            if (typeof input === "string") {
                return input;
            }
            // Use toString() at this point only if it is not the default version on Object.prototype.
            if (typeof input.toString === "function"
                && input.toString !== Object.prototype.toString
                && input.toString !== Array.prototype.toString) {
                return input.toString();
            }
            return null;
        };
        var out = customStringify(doc);
        if (typeof out === "string") {
            return out;
        }
        var message = doc.message;
        out = customStringify(message);
        if (typeof out === "string") {
            return out;
        }
        var inspected = util.inspect(doc);
        var result = inspected.length > MESSAGE_MAX_LENGTH
            ? inspected.substring(0, MESSAGE_MAX_LENGTH - 3) + SNIP_MARKER
            : inspected;
        return result;
    };
    /**
     * Ensure a log level is in the allowed value set.
     *
     * While this is useless for TS code, JS code using the compiled version of
     * the module still needs that check.
     *
     * @see Logger.log()
     *
     * @param requestedLevel
     *   A RFC5424 level.
     *
     * @throws InvalidArgumentException
     *   As per PSR-3, if level is not a valid RFC5424 level.
     */
    Logger.validateLevel = function (requestedLevel) {
        if (!Number.isInteger(requestedLevel)
            || +requestedLevel < LogLevel.EMERGENCY
            || +requestedLevel > LogLevel.DEBUG) {
            throw new InvalidArgumentException_1.default("The level argument to log() must be an RFC5424 level.");
        }
    };
    /**
     * Arm the report subscriber.
     *
     * @returns
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
     * Add defaults to the initial context.
     *
     * @param initialContext
     *   The context passed to logExtended().
     *
     * This method is only made public for the benefit of tests: it is not meant
     * to be used outside the class and its tests.
     *
     * @protected
     */
    Logger.prototype.defaultContext = function (initialContext) {
        var hostName = this._getHostname();
        if (typeof hostName === "string") {
            initialContext[IContext_1.KEY_HOST] = hostName;
        }
        Logger.stamp(initialContext, "log", this.side);
        return initialContext;
    };
    /**
     * Disarm the subscriber.
     *
     * In most cases, we do not want to disarm immediately: a stack trace being
     * built may take several hundred milliseconds, and we would lose it.
     *
     * @param delay
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
        var _a;
        if (details === void 0) { details = {}; }
        return _a = {},
            _a[IContext_1.KEY_DETAILS] = details,
            _a[IContext_1.KEY_SOURCE] = this.side,
            _a;
    };
    /**
     * Return the "reserved" keys of a context, made of its predefined keys.
     *
     * @param context
     *   The initial context.
     *
     * @return
     *   A context containing only these keys.
     */
    Logger.prototype.getReservedContext = function (context) {
        var result = {};
        [IContext_1.KEY_DETAILS, IContext_1.KEY_HOST, IContext_1.KEY_SOURCE, IContext_1.KEY_TS].forEach(function (v) {
            if (context[v] !== undefined) {
                result[v] = context[v];
            }
        });
        return result;
    };
    /** @inheritDoc */
    Logger.prototype.info = function (message, context) {
        if (context === void 0) { context = {}; }
        this.log(LogLevel.INFORMATIONAL, message, context);
    };
    /** @inheritDoc */
    Logger.prototype.log = function (level, message, details) {
        Logger.validateLevel(level);
        var c1 = this.getInitialContext(details);
        var c2 = this.defaultContext(c1);
        var preservedTop = this.getReservedContext(c2);
        var initialKeys = Object.keys(c2);
        var c3 = this.process(c2);
        var c4 = this.source(c3, preservedTop, initialKeys);
        this.send(this.strategy, level, Logger.stringifyMessage(message), c4);
    };
    /**
     * Process a context by applying processors, returning a non-sourced result.
     *
     * This is an internal step, only made public to enable testing. Do not use it
     * in userland code.
     *
     * @param context
     *   The context to process.
     *
     * @return
     *   The context transformed by applying processors to it, but not sourcing.
     *
     * @internal
     * @protected
     */
    Logger.prototype.process = function (context) {
        return this.processors.reduce(Logger.processorReducer, context);
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
     * @returns
     */
    Logger.prototype.send = function (strategy, level, message, sentContext) {
        var senders = strategy.selectSenders(level, message, sentContext);
        senders.forEach(function (sender) {
            sender.send(level, message, sentContext);
        });
    };
    /**
     * Source a (typically processed) context.
     *
     * This is an internal step, only made public to enable testing. Do not use it
     * in userland code.
     *
     * @param context
     *   The context to source
     * @param initialTop
     *   A context made of only the reserved keys in the initial context.
     * @param initialKeys
     *   An array of all the keys in the initial context.
     *
     * @return
     *   The sourced context.
     *
     * @internal
     * @protected
     */
    Logger.prototype.source = function (context, initialTop, initialKeys) {
        var _a, e_1, _b;
        var keys = Object.keys(context);
        // Shortcut evaluation if no processor added anything.
        if (keys.length === 0) {
            return initialTop;
        }
        var c1 = (_a = {},
            _a[this.side] = {},
            _a);
        try {
            for (var keys_1 = __values(keys), keys_1_1 = keys_1.next(); !keys_1_1.done; keys_1_1 = keys_1.next()) {
                var k = keys_1_1.value;
                var isInitial = initialKeys.includes(k);
                if (isInitial) {
                    c1[k] = context[k];
                }
                else {
                    c1[this.side][k] = context[k];
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (keys_1_1 && !keys_1_1.done && (_b = keys_1.return)) _b.call(keys_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (Object.keys(c1[this.side]).length === 0) {
            delete c1[this.side];
        }
        var c2 = __assign(__assign({}, c1), initialTop);
        return c2;
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
     * @param _LEVEL
     *   One of the 4 Meteor log levels as a string.
     *
     * @todo (or not ?) merge in the funky Meteor logic from the logging package.
     */
    Logger.prototype._meteorLog = function (_LEVEL) { return; };
    /**
     * Child classes are expected to re-implement this.
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