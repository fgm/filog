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
var os_1 = require("os");
var process_1 = __importDefault(require("process"));
var util = __importStar(require("util"));
var Logger_1 = __importDefault(require("./Logger"));
var LogLevel = __importStar(require("./LogLevel"));
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
        _this.maxReqListeners = 11;
        _this.servePath = "/logger";
        _this.output = process_1.default.stdout;
        var defaultParameters = {
            enableMethod: true,
            logRequestHeaders: true,
            // Preserve the legacy Filog default, but allow configuration.
            maxReqListeners: 11,
            servePath: "/logger",
        };
        // Loop on defaults, not arguments, to avoid injecting any random junk.
        for (var key in defaultParameters) {
            if (defaultParameters.hasOwnProperty(key)) {
                var k = key;
                var value = (typeof parameters[k] !== "undefined")
                    ? parameters[k]
                    : defaultParameters[k];
                // We took care NOT to have undefined, so tell it to the compiler.
                _this[k] = value;
            }
        }
        _this.hostname = os_1.hostname();
        if (_this.enableMethod) {
            Meteor.methods((_a = {}, _a[Logger_1.default.METHOD] = _this.logMethod.bind(_this), _a));
        }
        _this.setupConnect(webapp, _this.servePath);
        return _this;
    }
    /**
     * Return a plain object for all types of context values.
     *
     * @param rawContext
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
    ServerLogger.stringifyMessage = function (doc) {
        if (typeof doc === "string") {
            return doc;
        }
        var rawMessage = doc.message;
        if (rawMessage) {
            if (typeof rawMessage === "string") {
                return rawMessage;
            }
            else if (typeof rawMessage.toString === "function") {
                return rawMessage.toString();
            }
        }
        var message = util.inspect(doc);
        return message;
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
                var message = ServerLogger.stringifyMessage(doc);
                if (typeof doc.context === "undefined") {
                    doc.context = {};
                }
                var context = ServerLogger.objectifyContext(doc.context);
                if (_this.logRequestHeaders) {
                    context.requestHeaders = req.headers;
                }
                _this.log(level, message, context, false);
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
     * @inheritDoc
     */
    ServerLogger.prototype.log = function (level, message, rawContext, cooked) {
        if (cooked === void 0) { cooked = true; }
        rawContext.hostname = this.hostname;
        _super.prototype.log.call(this, level, message, rawContext, cooked);
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
        this.log(level, message, context, true);
    };
    /**
     * Sets up the Connect routing within the Meteor webapp component.
     *
     * @param webapp
     *   The Meteor webapp service (Connect wrapper).
     * @param servePath
     *   The path on which to expose the server logger. Must NOT start by a "/".
     *
     * @returns {void}
     */
    ServerLogger.prototype.setupConnect = function (webapp, servePath) {
        this.webapp = webapp;
        if (this.webapp) {
            this.output.write("Serving logger on " + servePath + ".\n");
            var app = this.webapp.connectHandlers;
            app.use(this.servePath, this.handleClientLogRequest.bind(this));
        }
        else {
            this.output.write("Not serving logger, path " + servePath + ".\n");
        }
    };
    return ServerLogger;
}(Logger_1.default));
exports.default = ServerLogger;
//# sourceMappingURL=ServerLogger.js.map