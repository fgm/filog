"use strict";
/**
 * @fileOverview Server-side Logger.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerSide = exports.ServerLogger = void 0;
var os = __importStar(require("os"));
var process_1 = __importDefault(require("process"));
// Package imports.
var IContext_1 = require("../IContext");
var LogLevel = __importStar(require("../LogLevel"));
var ClientLogger_1 = require("./ClientLogger");
var Logger_1 = require("./Logger");
var ServerSide = "server";
exports.ServerSide = ServerSide;
/**
 * An extension of the base logger which accepts log input on a HTTP URL.
 *
 * Its main method is log(level, message, context).
 *
 * @see ServerLogger.log
 */
var ServerLogger = /** @class */ (function (_super) {
    __extends(ServerLogger, _super);
    // noinspection JSClassNamingConvention
    /**
     * @constructor
     *
     * @param {StrategyBase} strategy
     *   A logging strategy instance.
     * @param {WebApp} webapp
     *   The Meteor WebApp service.
     * @param parameters
     * - enableMethod: enable the filog:log method or not. Defaults to true.
     * - logRequestHeaders: add request headers to the log context. Defaults to true.
     * - maxReqListeners: maximum number of request listeners. Defaults to 11.
     * - servePath: the path on which to expose the logger endpoint. Defaults to "/logger".
     */
    function ServerLogger(strategy, webapp, parameters) {
        var _a;
        if (webapp === void 0) { webapp = null; }
        if (parameters === void 0) { parameters = {}; }
        var _this = _super.call(this, strategy) || this;
        _this.webapp = webapp;
        _this.enableMethod = true;
        _this.logRequestHeaders = true;
        // Preserve the legacy Filog default, but allow configuration.
        _this.maxReqListeners = 11;
        _this.servePath = "/logger";
        // Should usually not be modified.
        _this.side = "server";
        _this.verbose = false;
        _this.output = process_1.default.stdout;
        _this.side = ServerSide;
        // XXX Use a loop again: TS3.4 broke the previous loop with no obvious fix.
        if (typeof parameters.enableMethod !== "undefined") {
            _this.enableMethod = parameters.enableMethod;
        }
        if (typeof parameters.logRequestHeaders !== "undefined") {
            _this.logRequestHeaders = parameters.logRequestHeaders;
        }
        if (typeof parameters.maxReqListeners !== "undefined") {
            _this.maxReqListeners = parameters.maxReqListeners;
        }
        if (typeof parameters.servePath !== "undefined") {
            _this.servePath = parameters.servePath;
        }
        if (typeof parameters.verbose !== "undefined") {
            _this.verbose = parameters.verbose;
        }
        _this.hostname = os.hostname();
        if (_this.enableMethod) {
            Meteor.methods((_a = {}, _a[Logger_1.Logger.METHOD] = _this.logMethod.bind(_this), _a));
        }
        _this.setupConnect(webapp, _this.servePath);
        return _this;
    }
    /**
     * Return a plain object for all types of context values.
     *
     * @param rawContext
     *   Expect a POJO but accept just about anything.
     *   Expect a POJO but accept just about anything.
     *
     * @returns {{}}
     *   - Contexts which are objects are returned as the same key/values, but as
     *     POJOs, even for arrays.
     *   - Scalar contexts are returned as { value: <original value> }
     */
    ServerLogger.objectifyContext = function (rawContext) {
        var context;
        if (typeof rawContext === "object") {
            // JS null is an object: handle it like a scalar.
            if (rawContext === null) {
                context = { value: null };
            }
            else {
                var className = rawContext.constructor.name;
                switch (className) {
                    case "Date":
                        context = rawContext.toISOString();
                        break;
                    // Boxing wrappers need to be converted to the primitive value.
                    case "Boolean":
                    case "Number":
                    case "String":
                        context = rawContext.valueOf();
                        break;
                    // POJOs can be used as such.
                    case "Object":
                        context = rawContext;
                        break;
                    // Arrays and classed objects need to be downgraded to POJOs.
                    default:
                        context = Object.assign({}, rawContext);
                        break;
                }
            }
        }
        else {
            // Other data types are scalars, so we need to wrap them in an object.
            context = { value: rawContext };
        }
        return context;
    };
    /**
     * Handle a log message from the client.
     *
     * @param req
     *   The request.
     * @param res
     *   The response.
     * @param _NEXT
     *   A callback, not used currently.
     *
     * @returns {void}
     */
    ServerLogger.prototype.handleClientLogRequest = function (req, res, _NEXT) {
        var _this = this;
        var method = (req.method || "GET").toUpperCase();
        if (method !== "POST") {
            // RFC2616: 405 means Method not allowed.
            res.writeHead(405);
            res.end();
            return;
        }
        // Early filog versions needed at least 11, while Node.JS is 10.
        // This appears to no longer be needed, but ensure it can be configured.
        req.setMaxListeners(this.maxReqListeners);
        var body = "";
        req.setEncoding("utf-8");
        req.on("data", function (chunk) { body += chunk; });
        req.on("end", Meteor.bindEnvironment(function () {
            var result;
            try {
                var doc = JSON.parse(body);
                // RFC 5424 Table 2: 7 == debug.
                var level = (typeof doc.level !== "undefined") ? parseInt(doc.level, 10) : 7;
                var message = Logger_1.Logger.stringifyMessage(doc);
                if (typeof doc.context === "undefined") {
                    doc.context = {};
                }
                var context = ServerLogger.objectifyContext(doc.context);
                if (_this.logRequestHeaders) {
                    context.requestHeaders = req.headers;
                }
                var _a = context, _b = IContext_1.KEY_DETAILS, details = _a[_b], 
                // tslint:disable-next-line
                nonDetails = __rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
                _this.logExtended(level, message, nonDetails, ClientLogger_1.ClientSide);
                res.statusCode = 200;
                result = "";
            }
            catch (err) {
                res.statusCode = 422;
                result = "Could not parse JSON message: " + err.message + ".";
            }
            res.end(result);
        }));
    };
    /**
     * Extended syntax for log() method.
     *
     * @private
     *
     * @param level
     *   The event level.
     * @param message
     *   The event message.
     * @param context
     *   The context added to the details by upstream processors.
     * @param source
     *   The upstream sender type. Allow logging with source set from an incoming
     *   log event, as in client-sender logging or during tests.
     *
     * @throws InvalidArgumentException
     */
    ServerLogger.prototype.logExtended = function (level, message, context, source) {
        var _a;
        if (source === void 0) { source = ServerSide; }
        Logger_1.Logger.validateLevel(level);
        var c1 = __assign(__assign({}, context), (_a = {}, _a[IContext_1.KEY_SOURCE] = source, _a));
        var c2 = this.defaultContext(c1);
        var preservedTop = this.getReservedContext(c2);
        var initialKeys = Object.keys(c2);
        var c3 = this.process(c2);
        var c4 = this.source(c3, preservedTop, initialKeys);
        this.send(this.strategy, level, Logger_1.Logger.stringifyMessage(message), c4);
    };
    /**
     * The Meteor server method registered a ${Logger.METHOD}.
     *
     * @param {number} level
     *   The event level.
     * @param {string} message
     *   The event message.
     * @param {Object} context
     *   The event context: any additional data added to the message.
     *
     * @returns {void}
     */
    ServerLogger.prototype.logMethod = function (_a) {
        var _b = _a.level, level = _b === void 0 ? LogLevel.INFO : _b, _c = _a.message, message = _c === void 0 ? "" : _c, _d = _a.context, context = _d === void 0 ? {} : _d;
        this.logExtended(level, message, context, ClientLogger_1.ClientSide);
    };
    /**
     * Sets up the Connect routing within the Meteor webapp component.
     *
     * @param webapp
     *   The Meteor webapp service (Connect wrapper).
     * @param servePath
     *   The path on which to expose the server logger. Must NOT start by a "/".
     */
    ServerLogger.prototype.setupConnect = function (webapp, servePath) {
        this.webapp = webapp;
        if (this.webapp) {
            if (this.verbose) {
                this.output.write("Serving logger on " + servePath + ".\n");
            }
            var app = this.webapp.connectHandlers;
            app.use(this.servePath, this.handleClientLogRequest.bind(this));
        }
        else {
            if (this.verbose) {
                this.output.write("Not serving logger, path " + servePath + ".\n");
            }
        }
    };
    /**
     * @inheritDoc
     */
    ServerLogger.prototype._getHostname = function () {
        if (!this.hostname) {
            this.hostname = os.hostname();
        }
        return this.hostname;
    };
    return ServerLogger;
}(Logger_1.Logger));
exports.ServerLogger = ServerLogger;
//# sourceMappingURL=ServerLogger.js.map