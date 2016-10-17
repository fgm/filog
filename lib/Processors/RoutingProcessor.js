'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ProcessorBase2 = require('./ProcessorBase');

var _ProcessorBase3 = _interopRequireDefault(_ProcessorBase2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RoutingProcessor = function (_ProcessorBase) {
  _inherits(RoutingProcessor, _ProcessorBase);

  function RoutingProcessor() {
    _classCallCheck(this, RoutingProcessor);

    var _this = _possibleConstructorReturn(this, (RoutingProcessor.__proto__ || Object.getPrototypeOf(RoutingProcessor)).call(this));

    if (!window || !window.location) {
      throw new Error('Cannot provide route information without location information.');
    }
    return _this;
  }

  /** @inheritdoc */


  _createClass(RoutingProcessor, [{
    key: 'process',
    value: function process(context) {
      // Overwrite any previous routing information in context.
      var result = Object.assign({}, context, { routing: { location: window.location } });
      return result;
    }
  }]);

  return RoutingProcessor;
}(_ProcessorBase3.default);

exports.default = RoutingProcessor;