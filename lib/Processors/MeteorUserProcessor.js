"use strict";
/** global: Package */
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
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ProcessorBase_1 = __importDefault(require("./ProcessorBase"));
var callsite_1 = __importDefault(require("callsite"));
var IContext_1 = require("../IContext");
/**
 * MeteorUserProcessor adds Meteor account information to log events.
 *
 * @extends ProcessorBase
 */
var MeteorUserProcessor = /** @class */ (function (_super) {
    __extends(class_1, _super);
    /**
     * @param meteor
     *   The Meteor service.
     * @param postProcess
     *   Optional. A post-process callback to be invoked after the main process().
     */
    function class_1(meteor, postProcess) {
        if (meteor === void 0) { meteor = Meteor; }
        if (postProcess === void 0) { postProcess = null; }
        var _this = _super.call(this) || this;
        _this.meteor = meteor;
        _this.postProcess = postProcess;
        if (!meteor) {
            throw new Error("Meteor processor is only meant for Meteor code.");
        }
        if (meteor.isClient) {
            _this.platform = "client";
            if (!meteor.user || meteor.user.constructor.name !== "Function") {
                throw new Error("Meteor client-side processor need an accounts package to be active.");
            }
        }
        else if (meteor.isServer) {
            _this.platform = "server";
            var accounts = Package["accounts-base"];
            if (typeof accounts === "undefined" || !accounts.AccountsServer) {
                throw new Error("Meteor server-side processor need an accounts package to be active.");
            }
        }
        else {
            throw new Error("This version of the meteor user processor only supports client and server platforms.");
        }
        _this.meteor = meteor;
        _this.postProcess = postProcess;
        _this.userCache = {};
        return _this;
    }
    /**
     * Return a default empty user, with required fill set to empty values.
     *
     * @param {String} id
     *   Optional. A user id.
     * @returns {Object}
     *   An account object initialized for anonymous.
     *
     */
    class_1.prototype.getAnonymousAccount = function (id) {
        if (id === void 0) { id = 0; }
        return {
            _id: id,
            emails: [],
            profile: {},
            services: {},
            username: null,
        };
    };
    /**
     * Get this.userId on the logger caller.
     *
     * Builds on v8 internals, so only works server-side (nodejs) or browsers with
     * a v8 engine.
     *
     * @TODO Assumes Error.stackTraceLimit is sufficient: default is 10, it
     * usually needs only 8 to climb up to the log caller. Maybe
     * check/increase/restore for safety ?
     *
     * @returns
     *   The user id. Undefined when not logged-in.
     */
    class_1.prototype.v8getUserId = function () {
        var e_1, _a;
        var stackValue = callsite_1.default();
        var state = "below-logger";
        var result = "";
        try {
            for (var stackValue_1 = __values(stackValue), stackValue_1_1 = stackValue_1.next(); !stackValue_1_1.done; stackValue_1_1 = stackValue_1.next()) {
                var frame = stackValue_1_1.value;
                // Work around v8 bug 1164933005
                var klass = frame.receiver
                    ? frame.getTypeName()
                    : null;
                switch (state) {
                    case "below-logger":
                        if (klass === "ServerLogger") {
                            state = "in-logger";
                        }
                        break;
                    case "1":
                        if (klass !== "ServerLogger") {
                            state = "in-caller";
                        }
                        break;
                    default:
                        break;
                }
                if (state === "in-caller") {
                    result = String(frame.getThis().userId);
                    break;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (stackValue_1_1 && !stackValue_1_1.done && (_a = stackValue_1.return)) _a.call(stackValue_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return result;
    };
    /**
     * Return the current user information, as far as possible.
     *
     * @returns {Object}
     *   A user object, possibly for an anonymous account.
     */
    class_1.prototype.getUser = function () {
        var result;
        // We ruled out other platforms beyond client and server in constructor.
        if (this.meteor.isClient) {
            result = this.meteor.user();
        }
        else {
            // In methods, get this.userId from logger caller.
            var id = this.v8getUserId();
            if (id !== "" && id !== undefined) {
                if (!this.userCache[id]) {
                    var user = this.meteor.users.findOne({ _id: id });
                    this.userCache[id] = (typeof user === "undefined")
                        ? this.getAnonymousAccount(Number(id))
                        : user;
                }
                result = this.userCache[id];
            }
            else {
                // In publish functions, may work with reactive-publish
                // @see https://github.com/meteor/meteor/issues/5462
                var user = void 0;
                try {
                    user = this.meteor.user();
                }
                catch (e) {
                    // Worst case: provide a default anonymous account.
                    user = this.getAnonymousAccount();
                }
                result = user;
            }
        }
        return result;
    };
    /** @inheritdoc */
    class_1.prototype.process = function (context) {
        var _a;
        var user = this.getUser();
        // Cannot delete property from undefined or null.
        if (user && user.services) {
            delete user.services.resume;
        }
        // Overwrite any previous userId information in context. Unlike client or
        // mobile information, a straight server-side log context is not rebuilt by
        // a call to logExtended, so it needs to be set directly in place under a
        // platform key.
        var userContext = (context[IContext_1.SOURCE_KEY] === this.platform)
            ? (_a = {}, _a[this.platform] = { user: user }, _a) : { user: user };
        var result = Object.assign({}, context, userContext);
        if (this.postProcess) {
            result = this.postProcess(result);
        }
        return result;
    };
    return class_1;
}(ProcessorBase_1.default));
exports.default = MeteorUserProcessor;
//# sourceMappingURL=MeteorUserProcessor.js.map