"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require("path");

var path = _interopRequireWildcard(_path);

var _modernSyslog = require("modern-syslog");

var modernSyslog = _interopRequireWildcard(_modernSyslog);

var _util = require("util");

var util = _interopRequireWildcard(_util);

var _SenderBase2 = require("./SenderBase");

var _SenderBase3 = _interopRequireDefault(_SenderBase2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileOverview Syslog Sender class.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


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
 *
 * @extends SenderBase
 */
var SyslogSender = function (_SenderBase) {
  _inherits(SyslogSender, _SenderBase);

  // noinspection JSClassNamingConvention
  /**
   * @constructor
   *
   * @param {String} ident
   *   Optional: the syslog identifier. Used as a prefix on messages.
   * @param {Object} syslogOptions
   *   Optional: a bit-level OR of syslog.LOG* option constants.
   * @param {Number} syslogFacility
   *   Optional: one of the standard RFC5424 facilities.
   * @param {Syslog} syslog
   *   The modern-syslog service or a compatible alternative.
   * @param {Object} formatOptions
   *   Optional : The options used to format the message. The contents depends
   *   on the serializer used. Defaults to { depth: 5 }), for the legacy
   *   "util.inspect" serializer, now available as serializeInspect().
   * @param {Function} serialize
   *   Optional: a serializer function converting a document to a string.
   *
   * @see serializeDefault
   * @see modern-syslog/core.cc
   */
  function SyslogSender() {
    var ident = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var syslogOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var syslogFacility = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var syslog = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    var formatOptions = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
    var serialize = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;

    _classCallCheck(this, SyslogSender);

    var _this = _possibleConstructorReturn(this, (SyslogSender.__proto__ || Object.getPrototypeOf(SyslogSender)).call(this));

    var programName = path.basename(process.argv[1]);
    var actualIdent = ident || programName;

    _this.syslog = syslog || modernSyslog;

    _this.facility = syslogFacility || _this.syslog.facility.LOG_LOCAL0;
    _this.ident = actualIdent;
    _this.option = syslogOptions || _this.syslog.option.LOG_PID;
    _this.formatOptions = formatOptions || { depth: 5 };
    _this.serialize = serialize || _this.serializeDefault.bind(_this);

    _this.syslog.open(_this.ident, _this.option, _this.facility);
    return _this;
  }

  /**
   * @inheritDoc
   */


  _createClass(SyslogSender, [{
    key: "send",
    value: function send(level, message, context) {
      var doc = {
        message: message,
        level: this.syslog.level[level],
        facility: this.syslog.facility[this.facility]
      };

      // It should already contain a timestamp object anyway.
      if (typeof context !== "undefined") {
        doc.context = context;
      }

      this.syslog.log(level, this.serialize(doc));
    }

    /**
     * Serialize a message to JSON. Handles circular documents with a fallback.
     *
     * @param {Object} doc
     * - an object with 3 mandatory keys and an optional one:
     *   - message: a string or object, as per Meteor Log package
     *   - level: a numeric severity level, like modernSyslog.level.LOG_DEBUG
     *   - facility: a syslog facility, like modernSyslog.facility.LOG_LOCAL0
     *   - (Optional) context: an object of context values. Anything goes.
     *
     * @returns {string}
     *   The serialized version of the doc argument under the formatOptions rules.
     */

  }, {
    key: "serializeDefault",
    value: function serializeDefault(doc) {
      var result = void 0;
      try {
        result = JSON.stringify(doc);
      } catch (e1) {
        var step1 = {
          level: doc.level,
          facility: doc.facility,
          logger_error: "Cannot JSON.stringify logged data: " + e1.message + ".",
          raw: util.inspect(doc, this.formatOptions)
        };

        if (typeof doc.message === 'string') {
          step1.message = doc.message;
        }

        try {
          result = JSON.stringify(step1);
        } catch (e2) {
          // Critical problem: remove moving parts.
          // RFC 5424: level 3 = error, facility 14 == log alert.
          result = '{ "level":3, "facility":14, "error":"Serialization fallback error" }';
        }
      }

      return result;
    }

    /**
     * Serialize a message to Node.js util.inspect format.
     *
     * @param {Object} doc
     *   A document to serialize. Any structure.
     *
     * @returns {string}
     *   The serialized version of the doc argument under the formatOptions rules.
     */

  }, {
    key: "serializeInspect",
    value: function serializeInspect(doc) {
      return util.inspect(doc, this.formatOptions);
    }
  }]);

  return SyslogSender;
}(_SenderBase3.default);

exports.default = SyslogSender;