'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require('path');

var path = _interopRequireWildcard(_path);

var _modernSyslog = require('modern-syslog');

var modernSyslog = _interopRequireWildcard(_modernSyslog);

var _util = require('util');

var util = _interopRequireWildcard(_util);

var _SenderBase2 = require('./SenderBase');

var _SenderBase3 = _interopRequireDefault(_SenderBase2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
 */
var SyslogSender = function (_SenderBase) {
  _inherits(SyslogSender, _SenderBase);

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
   *   Optional : The options used to format the message (default to { depth: 5 }).
   */
  function SyslogSender() {
    var ident = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var syslogOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var syslogFacility = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var syslog = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    var formatOptions = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;

    _classCallCheck(this, SyslogSender);

    var _this = _possibleConstructorReturn(this, (SyslogSender.__proto__ || Object.getPrototypeOf(SyslogSender)).call(this));

    var programName = path.basename(process.argv[1]);
    var actualIdent = ident || programName;

    _this.syslog = syslog || modernSyslog;

    _this.facility = syslogFacility || _this.syslog.facility.LOG_LOCAL0;
    _this.ident = actualIdent;
    _this.option = syslogOptions || _this.syslog.option.LOG_PID;
    _this.formatOptions = formatOptions || { depth: 5 };

    _this.syslog.open(_this.ident, _this.option, _this.facility);
    return _this;
  }

  /**
   * @inheritDoc
   */


  _createClass(SyslogSender, [{
    key: 'send',
    value: function send(level, message, context) {
      var doc = {
        message: message,
        level: this.syslog.level[level],
        facility: this.syslog.facility[this.facility]
      };

      // It should already contain a timestamp object anyway.
      if (typeof context !== 'undefined') {
        doc.context = context;
      }
      this.syslog.log(level, util.inspect(doc, this.formatOptions));
    }
  }]);

  return SyslogSender;
}(_SenderBase3.default);

exports.default = SyslogSender;