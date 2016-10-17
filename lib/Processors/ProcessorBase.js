"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ProcessorBase = function () {
  function ProcessorBase() {
    _classCallCheck(this, ProcessorBase);
  }

  _createClass(ProcessorBase, [{
    key: "process",

    /**
     * The only required method for processor implementations.
     *
     * It assumes passed contexts are not mutated, so they are either returned as
     * such, as in this example implementation, or cloned à la Object.assign().
     *
     * @param {object} context
     *   The context object for a log event.
     *
     * @returns {object}
     *   The processed context object.
     */
    value: function process(context) {
      return context;
    }
  }]);

  return ProcessorBase;
}();

exports.default = ProcessorBase;