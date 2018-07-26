"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ProcessorBase2 = require("./ProcessorBase");

var _ProcessorBase3 = _interopRequireDefault(_ProcessorBase2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileOverview Browser Processor class.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


/**
 * Adds browser related information to an event context.
 *
 * - plugins, platform, product, userAgent
 * - memory information
 *
 * @extends ProcessorBase
 */
var BrowserProcessor = function (_ProcessorBase) {
  _inherits(BrowserProcessor, _ProcessorBase);

  /**
   * ProcessorBase ensures it is not being built outside a browser.
   *
   * @param {object} nav
   *   window.Navigator.
   * @param {object} win
   *   window.
   */
  function BrowserProcessor(nav, win) {
    _classCallCheck(this, BrowserProcessor);

    var _this = _possibleConstructorReturn(this, (BrowserProcessor.__proto__ || Object.getPrototypeOf(BrowserProcessor)).call(this));

    var actualNav = nav || (typeof navigator === "undefined" ? null : navigator);
    var actualWin = win || (typeof window === "undefined" ? null : window);

    if ((typeof actualNav === "undefined" ? "undefined" : _typeof(actualNav)) !== "object" || (typeof actualWin === "undefined" ? "undefined" : _typeof(actualWin)) !== "object" || !actualNav || !actualWin) {
      throw new ReferenceError("BrowserProcessor is only usable on browser-run code.");
    }

    _this.navigator = actualNav;
    _this.window = actualWin;
    return _this;
  }

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


  _createClass(BrowserProcessor, [{
    key: "process",
    value: function process(context) {
      var unknown = "unknown";
      var browserDefaults = {
        platform: unknown,
        userAgent: unknown
      };

      // Ensure a browser key exists, using the contents from context if available.
      var result = Object.assign({ browser: { performance: this.window.performance } }, context);

      // Overwrite existing browser keys in context, keeping non-overwritten ones.
      for (var key in browserDefaults) {
        if (browserDefaults.hasOwnProperty(key)) {
          result.browser[key] = this.navigator[key] || browserDefaults[key];
        }
      }

      result.browser.performance = this.window.performance && this.window.performance.memory ? {
        memory: {
          jsHeapSizeLimit: this.window.performance.memory.jsHeapSizeLimit,
          totalJSHeapSize: this.window.performance.memory.totalJSHeapSize,
          usedJSHeapSize: this.window.performance.memory.usedJSHeapSize
        }
      } : {};

      return result;
    }
  }]);

  return BrowserProcessor;
}(_ProcessorBase3.default);

exports.default = BrowserProcessor;