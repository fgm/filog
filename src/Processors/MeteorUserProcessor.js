import ProcessorBase from './ProcessorBase';

export default class MeteorUserProcessor extends ProcessorBase {
  constructor(meteor = Meteor) {
    super();
    if (!meteor) {
      throw new Error('Meteor processor is only meant for Meteor code.');
    }
    if (meteor.isClient) {
      this.platform = 'client';
      if (!meteor.user || meteor.user.constructor.name !== 'Function') {
        throw new Error('Meteor client-side processor need an accounts package to be active.');
      }
    }
    else if (meteor.isServer) {
      this.platform = 'server';
      const accounts = Package['accounts-base'];
      if (typeof accounts === 'undefined' || !accounts.AccountsServer) {
        throw new Error('Meteor server-side processor need an accounts package to be active.');
      }
    }
    else {
      throw new Error('This version of the meteor user processor only supports client and server platforms.');
    }
    this.meteor = meteor;
    this.userCache = {};
  }

  /**
   * Return a default empty user, with required fill set to empty values.
   *
   * @param {String} id
   *   Optional. A user id.
   * @returns {{_id: number, username: null, emails: Array, profile: {}, services: {}}}
   */
  getAnonymousAccount(id = 0) {
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
  getUser() {
    let result;
    if (this.meteor.isClient) {
      result = this.meteor.user();
    }
    // We ruled out other platforms beyond client and server in constructor.
    else {
      const id = this.userId;
      // In publish functions.
      if (typeof id !== 'undefined') {
        if (!this.userCache[id]) {
          let user = this.meteor.users.findOne({});
          this.userCache[id] = (typeof user === 'undefined')
            ? result = this.getAnonymousAccount(id)
            : user;
        }
        result = this.userCache[id];
      }
      else {
        let user;
        try {
          user = this.meteor.user();
        }
        catch (e) {
          user = this.getAnonymousAccount();
        }
        result = user;
      }
    }

    return result;
  }

  /** @inheritdoc */
  process(context) {
    // Overwrite any previous userId information in context.
    const result = Object.assign({}, context, {
      meteor: {
        platform: this.platform,
        user: this.getUser()
      }
    });
    return result;
  }
}
