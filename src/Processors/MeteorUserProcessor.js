/**
 * @fileOverview Meteor user Processor class.
 */
import ProcessorBase from "./ProcessorBase";
import stack from "callsite";

/**
 * MeteorUserProcessor adds Meteor server-side account information to log events.
 *
 * @extends ProcessorBase
 */
const MeteorUserProcessor = class extends ProcessorBase {
  /**
   * @param {Meteor} meteor
   *   The Meteor service.
   */
  constructor(meteor = Meteor) {
    super();
    if (!meteor) {
      throw new Error("Meteor processor is only meant for Meteor code.");
    }
    if (meteor.isClient) {
      this.platform = "client";
      if (!meteor.user || meteor.user.constructor.name !== "Function") {
        throw new Error("Meteor client-side processor need an accounts package to be active.");
      }
    }
    else if (meteor.isServer) {
      this.platform = "server";
      const accounts = Package["accounts-base"];
      if (typeof accounts === "undefined" || !accounts.AccountsServer) {
        throw new Error("Meteor server-side processor need an accounts package to be active.");
      }
    }
    else {
      throw new Error("This version of the meteor user processor only supports client and server platforms.");
    }
    this.meteor = meteor;
    this.userCache = {};
  }

  /**
   * Return a default empty user, with required fill set to empty values.
   *
   * @param {String} id
   *   Optional. A user id.
   * @returns {Object}
   *   An account object initialized for anonymous.
   *
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
   * Get this.userId on the logger caller.
   *
   * Builds on v8 internals, so only works server-side (nodejs) or browsers with
   * a v8 engine.
   *
   * @TODO Assumes Error.stackTraceLimit is sufficient: default is 10, it
   * usually needs only 8 to climb up to the log caller. Maybe
   * check/increase/restore for safety ?
   *
   * @returns {String|undefined}
   *   The user id.
   */
  v8getUserId() {
    const stackValue = stack();
    let state = "below-logger";
    let result;
    for (const frame of stackValue) {
      // Work around v8 bug 1164933005
      const klass = frame.receiver
        ? frame.getTypeName()
        : null;

      switch (state) {
        case "below-logger":
          if (klass === "ServerLogger") {
            state = "in-logger";
          }
          break;

        case 1:
          if (klass !== "ServerLogger") {
            state = "in-caller";
          }
          break;

        default:
          break;
      }
      if (state === "in-caller") {
        result = frame.getThis().userId;
        break;
      }
    }
    return result;
  }

  /** @inheritdoc */
  getTrustedKeys() {
    return ['meteor'];
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
      // In methods, get this.userId from logger caller.
      const id = this.v8getUserId();
      if (typeof id !== "undefined") {
        if (!this.userCache[id]) {
          let user = this.meteor.users.findOne({ _id: id });
          this.userCache[id] = (typeof user === "undefined")
            ? result = this.getAnonymousAccount(id)
            : user;
        }
        result = this.userCache[id];
      }
      // In publish functions, may work with reactive-publish
      // @see https://github.com/meteor/meteor/issues/5462
      else {
        let user;
        try {
          user = this.meteor.user();
        }
        catch (e) {
          // Worst case: provide a default anonymous account.
          user = this.getAnonymousAccount();
        }
        result = user;
      }
    }

    return result;
  }

  /** @inheritdoc */
  process(context) {
    let user = this.getUser();

    // Cannot delete property from undefined or null.
    if (user && user.services) {
      delete user.services.resume;
    }

    // Overwrite any previous userId information in context.
    const result = Object.assign({}, context, {
      meteor: {
        platform: this.platform,
        user
      }
    });
    return result;
  }
};

export default MeteorUserProcessor;
