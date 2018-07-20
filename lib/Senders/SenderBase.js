"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @fileOverview Base Sender class.
 */

/**
 * SenderBase is an "abstract" class defining the sender interface.
 */
var SenderBase = function () {
  function SenderBase() {
    _classCallCheck(this, SenderBase);
  }

  _createClass(SenderBase, [{
    key: "send",

    /**
     * The single method for a sender: send data somewhere.
     *
     * @param {int} level
     *   One of the 8 RFC5424 levels: 0 to 7.
     * @param {string} message
     *   Unlike LoggerBase::log(), it is not expected to handler non-string data.
     * @param {object} context
     *   A log event context object.
     *
     * @returns {void}
     */
    value: function send(level, message, context) {}
  }]);

  return SenderBase;
}();

exports.default = SenderBase;