"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ProcessorBase2 = require("./ProcessorBase");

var _ProcessorBase3 = _interopRequireDefault(_ProcessorBase2);

var _Logger = require("../Logger");

var _Logger2 = _interopRequireDefault(_Logger);

var _callsite = require("callsite");

var _callsite2 = _interopRequireDefault(_callsite);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /** global: Package */

/**
 * @fileOverview Meteor user Processor class.
 */

/**
 * MeteorUserProcessor adds Meteor account information to log events.
 *
 * @extends ProcessorBase
 */
var MeteorUserProcessor = function (_ProcessorBase) {
  _inherits(MeteorUserProcessor, _ProcessorBase);

  /**
   * @param {Meteor} meteor
   *   The Meteor service.
   * @param {Function} postProcess
   *   Optional. A post-process callback to be invoked after the main process().
   */
  function MeteorUserProcessor() {
    var meteor = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Meteor;
    var postProcess = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    _classCallCheck(this, MeteorUserProcessor);

    var _this = _possibleConstructorReturn(this, (MeteorUserProcessor.__proto__ || Object.getPrototypeOf(MeteorUserProcessor)).call(this));

    if (!meteor) {
      throw new Error("Meteor processor is only meant for Meteor code.");
    }
    if (meteor.isClient) {
      _this.platform = "client";
      if (!meteor.user || meteor.user.constructor.name !== "Function") {
        throw new Error("Meteor client-side processor need an accounts package to be active.");
      }
    } else if (meteor.isServer) {
      _this.platform = "server";
      var accounts = Package["accounts-base"];
      if (typeof accounts === "undefined" || !accounts.AccountsServer) {
        throw new Error("Meteor server-side processor need an accounts package to be active.");
      }
    } else {
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


  _createClass(MeteorUserProcessor, [{
    key: "getAnonymousAccount",
    value: function getAnonymousAccount() {
      var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      return {
        _id: id,
        username: null,
        emails: [],
        profile: {},
        services: {}
      };
    }

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
     * @returns {String|undefined}
     *   The user id.
     */

  }, {
    key: "v8getUserId",
    value: function v8getUserId() {
      var stackValue = (0, _callsite2.default)();
      var state = "below-logger";
      var result = "";
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = stackValue[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var frame = _step.value;

          // Work around v8 bug 1164933005
          var klass = frame.receiver ? frame.getTypeName() : null;

          switch (state) {
            case "below-logger":
              if (klass === "ServerLogger") {
                state = "in-logger";
              }
              break;

            case 1:
              if (klass !== "ServerLogger") {
                state = "in-caller";
              }
              break;

            default:
              break;
          }
          if (state === "in-caller") {
            result = frame.getThis().userId;
            break;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return result;
    }

    /**
     * Return the current user information, as far as possible.
     *
     * @returns {Object}
     *   A user object, possibly for an anonymous account.
     */

  }, {
    key: "getUser",
    value: function getUser() {
      var result = void 0;
      if (this.meteor.isClient) {
        result = this.meteor.user();
      }
      // We ruled out other platforms beyond client and server in constructor.
      else {
          // In methods, get this.userId from logger caller.
          var id = this.v8getUserId();
          if (id !== "") {
            if (!this.userCache[id]) {
              var user = this.meteor.users.findOne({ _id: id });
              this.userCache[id] = typeof user === "undefined" ? this.getAnonymousAccount(id) : user;
            }
            result = this.userCache[id];
          }
          // In publish functions, may work with reactive-publish
          // @see https://github.com/meteor/meteor/issues/5462
          else {
              var _user = void 0;
              try {
                _user = this.meteor.user();
              } catch (e) {
                // Worst case: provide a default anonymous account.
                _user = this.getAnonymousAccount();
              }
              result = _user;
            }
        }

      return result;
    }

    /** @inheritdoc */

  }, {
    key: "process",
    value: function process(context) {
      var user = this.getUser();

      // Cannot delete property from undefined or null.
      if (user && user.services) {
        delete user.services.resume;
      }

      // Overwrite any previous userId information in context. Unlike client or
      // mobile information, a straight server-side log context is not rebuilt by
      // a call to logExtended, so it needs to be set directly in place under a
      // platform key.
      var userContext = context[_Logger2.default.KEY_SOURCE] === this.platform ? _defineProperty({}, this.platform, { user: user }) : { user: user };
      var result = Object.assign({}, context, userContext);

      if (this.postProcess) {
        result = this.postProcess(result);
      }

      return result;
    }
  }]);

  return MeteorUserProcessor;
}(_ProcessorBase3.default);

exports.default = MeteorUserProcessor;