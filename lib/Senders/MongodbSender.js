'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _SenderBase2 = require('./SenderBase');

var _SenderBase3 = _interopRequireDefault(_SenderBase2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MongodbSender = function (_SenderBase) {
  _inherits(MongodbSender, _SenderBase);

  /**
   * @constructor
   *
   * @param {Mongo} mongo
   *   The Meteor Mongo service.
   * @param {String} collectionName
   *   The name of the collection in which to log.
   */

  function MongodbSender(mongo) {
    var collectionName = arguments.length <= 1 || arguments[1] === undefined ? 'logger' : arguments[1];

    _classCallCheck(this, MongodbSender);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(MongodbSender).call(this));

    _this.mongo = mongo;
    var collection = mongo.Collection.get(collectionName);
    _this.store = collection ? collection : new _this.mongo.Collection(collectionName);
    return _this;
  }

  _createClass(MongodbSender, [{
    key: 'send',
    value: function send(level, message, context) {
      var doc = { level: level, message: message };
      // It should already contain a timestamp object anyway.
      if (typeof context !== 'undefined') {
        doc.context = context;
      }
      doc.context.timestamp.store = Date.now();
      this.store.insert(doc);
    }
  }]);

  return MongodbSender;
}(_SenderBase3.default);

exports.default = MongodbSender;