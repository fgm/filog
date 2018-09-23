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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
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
var LogLevel = __importStar(require("./LogLevel"));
// const logMethodNames = ["log", "debug", "info", "warn", "error", "_exception" ];
var DETAILS_KEY = "message_details";
var HOST_KEY = "hostname";
var TS_KEY = "timestamp";
/**
 * Logger is the base class for loggers.
 */
var Logger = (_a = /** @class */ (function () {
        /**
         * @constructor
         *
         * @param {StrategyBase} strategy
         *   The sender selection strategy to apply.
         */
        function class_1(strategy) {
            this.strategy = strategy;
            this.processors = [];
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
            this.log(LogLevel.ERROR, e.message, e);
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
        /**
         * Implements the standard Meteor logger methods.
         *
         * This method is an implementation detail: do not depend on it.
         *
         * @param {String} level
         *   debug, info, warn, or error
         *
         * @returns {void}
         *
         * @todo (or not ?) merge in the funky Meteor logic from the logging package.
         */
        class_1.prototype._meteorLog = function () { return; };
        /** @inheritDoc */
        class_1.prototype.log = function (level, message, initialContext, process) {
            var _this = this;
            if (initialContext === void 0) { initialContext = {}; }
            if (process === void 0) { process = true; }
            /**
             * Reduce callback for processors.
             *
             * @see Logger.log()
             *
             * @param accu
             *   The reduction accumulator.
             * @param current
             *   The current process to apply in the reduction.
             *
             * @returns
             *   The result of the current reduction step.
             */
            var processorReducer = function (accu, current) {
                var result = current.process(accu);
                return result;
            };
            var applyProcessors = function (rawContext) {
                // Context may contain message_details and timestamps from upstream. Merge them.
                var _a;
                var _b = DETAILS_KEY, initialDetails = rawContext[_b], _c = TS_KEY, initialTs = rawContext[_c], _d = HOST_KEY, initialHost = rawContext[_d], 
                // TS forbids trailing commas on rest parms, TSLint requires them...
                // tslint:disable-next-line
                contextWithoutDetails = __rest(rawContext, [typeof _b === "symbol" ? _b : _b + "", typeof _c === "symbol" ? _c : _c + "", typeof _d === "symbol" ? _d : _d + ""]);
                var processedContext = _this.processors.reduce(processorReducer, (_a = {},
                    _a[DETAILS_KEY] = contextWithoutDetails,
                    _a));
                // New context details keys, if any, with the same name override existing ones.
                var details = __assign({}, initialDetails, processedContext[DETAILS_KEY]);
                if (Object.keys(details).length > 0) {
                    processedContext[DETAILS_KEY] = details;
                }
                processedContext[TS_KEY] = __assign({}, initialTs, processedContext[TS_KEY]);
                // Only add the initial [HOST_KEY] if none has been added and one existed.
                if (typeof processedContext[HOST_KEY] === "undefined" && typeof initialHost !== "undefined") {
                    processedContext[HOST_KEY] = initialHost;
                }
                return processedContext;
            };
            if (!Number.isInteger(level) || +level < LogLevel.EMERGENCY || +level > LogLevel.DEBUG) {
                throw new InvalidArgumentException_1.default("The level argument to log() must be an RFC5424 level.");
            }
            var finalContext = process ? applyProcessors(initialContext) : initialContext;
            // A timestamp is required, so insert it forcefully.
            finalContext.timestamp = { log: Date.now() };
            var senders = this.strategy.selectSenders(level, String(message), finalContext);
            senders.forEach(function (sender) {
                sender.send(level, String(message), finalContext);
            });
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
        /** @inheritDoc */
        class_1.prototype.warn = function (message, context) {
            if (context === void 0) { context = {}; }
            this.log(LogLevel.WARNING, message, context);
        };
        /** @inheritDoc */
        class_1.prototype.error = function (message, context) {
            if (context === void 0) { context = {}; }
            this.log(LogLevel.ERROR, message, context);
        };
        return class_1;
    }()),
    _a.METHOD = "filog:log",
    _a);
exports.default = Logger;
//# sourceMappingURL=Logger.js.map