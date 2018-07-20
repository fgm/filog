"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Logger = require("../Logger");

var _Logger2 = _interopRequireDefault(_Logger);

var _SenderBase2 = require("./SenderBase");

var _SenderBase3 = _interopRequireDefault(_SenderBase2);

var _ServerLogger = require("../ServerLogger");

var _ServerLogger2 = _interopRequireDefault(_ServerLogger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @fileOverview MongoDB Sender class.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


/**
 * MongodbSender sends logs to the Meteor standard database.
 *
 * @extends SenderBase
 */
var MongodbSender = function (_SenderBase) {
  _inherits(MongodbSender, _SenderBase);

  // noinspection JSClassNamingConvention
  /**
   * @constructor
   *
   * @param {Mongo} mongo
   *   The Meteor Mongo service.
   * @param {(String|Collection)} collection
   *   The collection or the name of the collection in which to log.
   */
  function MongodbSender(mongo) {
    var collection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "logger";

    _classCallCheck(this, MongodbSender);

    var _this = _possibleConstructorReturn(this, (MongodbSender.__proto__ || Object.getPrototypeOf(MongodbSender)).call(this));

    if (collection instanceof mongo.Collection) {
      _this.store = collection;
    } else if (typeof collection === "string") {
      var collectionName = collection;
      _this.store = new mongo.Collection(collectionName);
    } else {
      throw new Error("MongodbSender requires a Collection or a collection name");
    }
    return _this;
  }

  _createClass(MongodbSender, [{
    key: "send",
    value: function send(level, message, context) {
      var defaultedContext = context || {};
      var doc = { level: level, message: message };

      // It should contain a timestamp.{side} object if it comes from any Logger.
      if (typeof defaultedContext[_Logger2.default.KEY_TS] === "undefined") {
        defaultedContext[_Logger2.default.KEY_TS] = {
          server: {}
        };
      }
      doc.context = defaultedContext;

      // doc.context.timestamp.server is known to exist from above.
      _Logger2.default.prototype.stamp.call({ side: _ServerLogger2.default.side }, doc.context, "send");
      this.store.insert(doc);
    }
  }]);

  return MongodbSender;
}(_SenderBase3.default);

exports.default = MongodbSender;