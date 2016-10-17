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
    var meteor = arguments.length <= 0 || arguments[0] === undefined ? Meteor : arguments[0];

    _classCallCheck(this, MeteorUserProcessor);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(MeteorUserProcessor).call(this));

    if (!meteor) {
      throw new Error('Meteor processor is only meant for Meteor code.');
    }
    if (meteor.isClient) {
      _this.platform = 'client';
      if (!meteor.user || meteor.user.constructor.name !== 'Function') {
        throw new Error('Meteor client-side processor need an accounts package to be active.');
      }
    } else if (meteor.isServer) {
      _this.platform = 'server';
      var accounts = Package['accounts-base'];
      if (typeof accounts === 'undefined' || !accounts.AccountsServer) {
        throw new Error('Meteor server-side processor need an accounts package to be active.');
      }
    } else {
      throw new Error('This version of the meteor user processor only supports client and server platforms.');
    }
    _this.meteor = meteor;
    _this.userCache = {};
    return _this;
  }

  /**
   * Return a default empty user, with required fill set to empty values.
   *
   * @param {String} id
   *   Optional. A user id.
   * @returns {{_id: number, username: null, emails: Array, profile: {}, services: {}}}
   */


  _createClass(MeteorUserProcessor, [{
    key: 'getAnonymousAccount',
    value: function getAnonymousAccount() {
      var id = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

      return {
        _id: id,
        username: null,
        emails: [],
        profile: {},
        services: {}
      };
    }

    /**
     * Return the current user information, as far as possible.
     *
     * @returns {Object}
     *   A user object, possibly for an anonymous account.
     */

  }, {
    key: 'getUser',
    value: function getUser() {
      var result = void 0;
      if (this.meteor.isClient) {
        result = this.meteor.user();
      }
      // We ruled out other platforms beyond client and server in constructor.
      else {
          var id = this.userId;
          // In publish functions.
          if (typeof id !== 'undefined') {
            if (!this.userCache[id]) {
              var user = this.meteor.users.findOne({});
              this.userCache[id] = typeof user === 'undefined' ? result = this.getAnonymousAccount(id) : user;
            }
            result = this.userCache[id];
          } else {
            var _user = void 0;
            try {
              _user = this.meteor.user();
            } catch (e) {
              _user = this.getAnonymousAccount();
            }
            result = _user;
          }
        }

      return result;
    }

    /** @inheritdoc */

  }, {
    key: 'process',
    value: function process(context) {
      // Overwrite any previous userId information in context.
      var result = Object.assign({}, context, {
        meteor: {
          platform: this.platform,
          user: this.getUser()
        }
      });
      return result;
    }
  }]);

  return MeteorUserProcessor;
}(_ProcessorBase3.default);

exports.default = MeteorUserProcessor;