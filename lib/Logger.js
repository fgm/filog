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
var _a;
"use strict";
/**
 * @fileOverview Base Logger class.
 */
var tracekit_1 = __importDefault(require("tracekit"));
var InvalidArgumentException_1 = __importDefault(require("./InvalidArgumentException"));
var ISendContext_1 = require("./ISendContext");
var LogLevel = __importStar(require("./LogLevel"));
// const logMethodNames = ["log", "debug", "info", "warn", "error", "_exception" ];
var SIDE = "unknown";
/**
 * Logger is the base class for loggers.
 */
var Logger = (_a = /** @class */ (function () {
        /**
         * @constructor
         *
         * @param {StrategyBase} strategy
         *   The sender selection strategy to apply.
         *
         */
        function class_1(strategy) {
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
        class_1.levelName = function (level) {
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
         * Apply processors to a context, preserving reserved keys.
         *
         * @protected
         *
         * @param rawContext
         *   The context to process.
         *
         * @returns
         *   The processed context.
         */
        class_1.prototype.applyProcessors = function (rawContext) {
            var _a = ISendContext_1.TS_KEY, initialTs = rawContext[_a], _b = ISendContext_1.HOST_KEY, initialHost = rawContext[_b];
            var processedContext = this.processors.reduce(this.processorReducer, rawContext);
            // Timestamp is protected against modifications, for traceability.
            processedContext[ISendContext_1.TS_KEY] = __assign({}, initialTs, processedContext[ISendContext_1.TS_KEY]);
            // Only add the initial [HOST_KEY] if none has been added and one existed.
            if ((typeof processedContext[ISendContext_1.HOST_KEY] === "undefined") && typeof initialHost === "string") {
                // The "as" is not needed for the compiler but for TSLint.
                processedContext[ISendContext_1.HOST_KEY] = initialHost;
            }
            return processedContext;
        };
        /**
         * Arm the report subscriber.
         *
         * @returns {void}
         *
         * @see Logger#reportSubscriber
         */
        class_1.prototype.arm = function () {
            this.tk.report.subscribe(this.reportSubscriber.bind(this));
        };
        class_1.prototype.doProcess = function (apply, contextToProcess) {
            var _a;
            var finalContext = apply ? this.applyProcessors(contextToProcess) : contextToProcess;
            // A timestamp is required, so insert it forcefully.
            finalContext.timestamp = (_a = {}, _a[this.side] = { log: +Date.now() }, _a);
            return finalContext;
        };
        /**
         * Reduce callback for processors.
         *
         * @private
         * @see Logger.log()
         *
         * @param accu
         *   The reduction accumulator.
         * @param current
         *   The current process to apply in the reduction.
         *
         * @returns
         *   The result of the current reduction step.
         *
         */
        class_1.prototype.processorReducer = function (accu, current) {
            var result = current.process(accu);
            return result;
        };
        /**
         * The callback invoked by TraceKit
         *
         * @param e
         *   Error on which to report.
         */
        class_1.prototype.report = function (e) {
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
        class_1.prototype.reportSubscriber = function (e) {
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
        class_1.prototype.send = function (strategy, level, message, sentContext) {
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
        class_1.prototype.stamp = function (context, op) {
            var now = +new Date();
            if (!context[ISendContext_1.TS_KEY]) {
                context[ISendContext_1.TS_KEY] = {};
            }
            var contextTs = context[ISendContext_1.TS_KEY];
            var side = contextTs[this.side] || {};
            side[op] = now;
        };
        /**
         * Build a context object from log() details.
         *
         * @protected
         *
         * @see Logger.log
         *
         * @param details
         *   The message details passed to log().
         * @param source
         *   The source for the event.
         * @param context
         *   Optional: a pre-existing context.
         *
         * @returns
         *   The context with details moved to the message_details subkey.
         */
        class_1.prototype.buildContext = function (details, source, context) {
            if (context === void 0) { context = {}; }
            var _a;
            var context1 = __assign({}, context, (_a = {}, _a[ISendContext_1.DETAILS_KEY] = details, _a[ISendContext_1.SOURCE_KEY] = source, _a));
            if (details[ISendContext_1.HOST_KEY]) {
                context1[ISendContext_1.HOST_KEY] = details[ISendContext_1.HOST_KEY];
                delete context1[ISendContext_1.DETAILS_KEY][ISendContext_1.HOST_KEY];
            }
            return context1;
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
        class_1.prototype.disarm = function (delay) {
            var _this = this;
            if (delay === void 0) { delay = 2000; }
            setTimeout(function () {
                _this.tk.report.unsubscribe(_this.reportSubscriber);
            }, delay);
        };
        /** @inheritDoc */
        class_1.prototype.error = function (message, context) {
            if (context === void 0) { context = {}; }
            // FIXME: message may not be a string.
            this.log(LogLevel.ERROR, message, context);
        };
        /** @inheritDoc */
        class_1.prototype.log = function (level, message, initialContext, process) {
            if (initialContext === void 0) { initialContext = {}; }
            if (process === void 0) { process = true; }
            this.validateLevel(level);
            var context1 = this.buildContext(initialContext, this.side);
            var context2 = process
                ? this.applyProcessors(context1)
                : context1;
            this.stamp(context2, "log");
            // @FIXME this cast is not really correct to handle non-string messages.
            this.send(this.strategy, level, message, context2);
        };
        /** @inheritDoc */
        class_1.prototype.debug = function (message, context) {
            if (context === void 0) { context = {}; }
            this.log(LogLevel.DEBUG, message, context);
        };
        /** @inheritDoc */
        class_1.prototype.info = function (message, context) {
            if (context === void 0) { context = {}; }
            this.log(LogLevel.INFORMATIONAL, message, context);
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
        class_1.prototype.validateLevel = function (requestedLevel) {
            if (!Number.isInteger(requestedLevel)
                || +requestedLevel < LogLevel.EMERGENCY
                || +requestedLevel > LogLevel.DEBUG) {
                throw new InvalidArgumentException_1.default("The level argument to log() must be an RFC5424 level.");
            }
        };
        /** @inheritDoc */
        class_1.prototype.warn = function (message, context) {
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
        class_1.prototype._meteorLog = function () { return; };
        return class_1;
    }()),
    _a.METHOD = "filog:log",
    _a.side = SIDE,
    _a);
exports.default = Logger;
//# sourceMappingURL=Logger.js.map