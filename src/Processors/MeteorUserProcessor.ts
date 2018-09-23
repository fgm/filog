/** global: Package */

/**
 * @fileOverview Meteor user Processor class.
 */

import {IProcessor} from "./IProcessor";
import { ProcessorBase } from "./ProcessorBase";

import stack from "callsite";
import User = Meteor.User;
import { IContext, KEY_SOURCE} from "../IContext";
import { ServerSide } from "../Loggers/ServerLogger";

interface IPackage {
  "accounts-base": {
    AccountsClient: object,
    AccountsServer: object,
  };
}

interface ICallSite extends stack.CallSite {
  receiver: any;
}

declare var Package: IPackage;

/**
 * MeteorUserProcessor adds Meteor account information to log events.
 *
 * @extends ProcessorBase
 */
class MeteorUserProcessor extends ProcessorBase implements IProcessor {
  public platform: string;
  public userCache: { [key: string]: object };

  /**
   * @param meteor
   *   The Meteor service.
   * @param postProcess
   *   Optional. A post-process callback to be invoked after the main process().
   */
  constructor(public meteor = Meteor, public postProcess: ((r: {}) => {}) | null = null) {
    super();
    if (!meteor) {
      throw new Error("Meteor processor is only meant for Meteor code.");
    }
    if (meteor.isClient) {
      this.platform = "client";
      if (!meteor.user || meteor.user.constructor.name !== "Function") {
        throw new Error("Meteor client-side processor need an accounts package to be active.");
      }
    } else if (meteor.isServer) {
      this.platform = "server";
      const accounts = Package["accounts-base"];
      if (typeof accounts === "undefined" || !accounts.AccountsServer) {
        throw new Error("Meteor server-side processor need an accounts package to be active.");
      }
    } else {
      throw new Error("This version of the meteor user processor only supports client and server platforms.");
    }

    this.meteor = meteor;
    this.postProcess = postProcess;
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
  public getAnonymousAccount(id = 0) {
    return {
      _id: id,
      emails: [],
      profile: {},
      services: {},
      username: null,
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
   * @returns
   *   The user id. Undefined when not logged-in.
   */
  public v8getUserId(): string | undefined {
    const stackValue = stack();
    let state: string = "below-logger";
    let result = "";
    for (const frame of stackValue) {
      // Work around v8 bug 1164933005
      const klass = (frame as ICallSite).receiver
        ? frame.getTypeName()
        : null;

      switch (state) {
        case "below-logger":
          if (klass === "ServerLogger") {
            state = "in-logger";
          }
          break;

        case "1":
          if (klass !== "ServerLogger") {
            state = "in-caller";
          }
          break;

        default:
          break;
      }
      if (state === "in-caller") {
        result = String(frame.getThis().userId);
        break;
      }
    }

    return result;
  }

  /**
   * Return the current user information, as far as possible.
   *
   * @returns {Object}
   *   A user object, possibly for an anonymous account.
   */
  public getUser(): User {
    let result;
    // We ruled out other platforms beyond client and server in constructor.
    if (this.meteor.isClient) {
      result = this.meteor.user();
    } else {
      // In methods, get this.userId from logger caller.
      const id = this.v8getUserId();
      if (id !== "" && id !== undefined) {
        if (!this.userCache[id]) {
          const user = this.meteor.users.findOne({ _id: id });
          this.userCache[id] = (typeof user === "undefined")
            ? this.getAnonymousAccount(Number(id))
            : user;
        }
        result = this.userCache[id];
      } else {
        // In publish functions, may work with reactive-publish
        // @see https://github.com/meteor/meteor/issues/5462
        let user;
        try {
          user = this.meteor.user();
        } catch (e) {
          // Worst case: provide a default anonymous account.
          user = this.getAnonymousAccount();
        }
        result = user;
      }
    }

    return result;
  }

  /**
   * @inheritdoc
   *
   * @see ServerLogger.logExtended()
   */
  public process(context: IContext): IContext {
    const user = this.getUser();

    // Cannot delete property from undefined or null.
    if (user && user.services) {
      delete user.services.resume;
    }

    // Overwrite any previous userId information in context.
    //
    // Unlike client or mobile information, a straight server-side log context
    // is not rebuilt by a call to logExtended, so it needs to be set directly
    // in place under a platform key.
    const userContext = (context[KEY_SOURCE] === this.platform && this.platform === ServerSide)
      ? { [this.platform]: { user } }
      : { user };
    let result: IContext = { ...context, ... userContext };

    if (this.postProcess) {
      result = this.postProcess(result);
    }

    return result;
  }
}

export {
  MeteorUserProcessor,
};
