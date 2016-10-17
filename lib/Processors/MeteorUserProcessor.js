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

var MeteorUserProcessor = function (_ProcessorBase) {
  _inherits(MeteorUserProcessor, _ProcessorBase);

  function MeteorUserProcessor() {
    _classCallCheck(this, MeteorUserProcessor);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(MeteorUserProcessor).call(this));

    if (!Meteor || !Meteor.isClient || !Meteor.user || Meteor.user.constructor.name !== 'Function') {
      throw new Error('Meteor processor is only meant for client-side Meteor with an accounts package.');
    }
    _this.meteor = Meteor;
    return _this;
  }

  /** @inheritdoc */


  _createClass(MeteorUserProcessor, [{
    key: 'process',
    value: function process(context) {
      // Overwrite any previous userId information in context.
      var result = Object.assign({}, context, {
        meteor: {
          platform: 'client',
          userId: this.meteor.user()
        }
      });
      return result;
    }
  }]);

  return MeteorUserProcessor;
}(_ProcessorBase3.default);

exports.default = MeteorUserProcessor;