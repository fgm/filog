/** global: Package */
/// <reference types="meteor" />
/**
 * @fileOverview Meteor user Processor class.
 */
import { IProcessor } from "./IProcessor";
import { ProcessorBase } from "./ProcessorBase";
import User = Meteor.User;
import { IContext } from "../IContext";
/**
 * MeteorUserProcessor adds Meteor account information to log events.
 *
 * @extends ProcessorBase
 */
declare class MeteorUserProcessor extends ProcessorBase implements IProcessor {
    meteor: typeof Meteor;
    postProcess: ((r: {}) => {}) | null;
    platform: string;
    userCache: {
        [key: string]: object;
    };
    /**
     * @param meteor
     *   The Meteor service.
     * @param postProcess
     *   Optional. A post-process callback to be invoked after the main process().
     */
    constructor(meteor?: typeof Meteor, postProcess?: ((r: {}) => {}) | null);
    /**
     * Return a default empty user, with required fill set to empty values.
     *
     * @param {String} id
     *   Optional. A user id.
     * @returns {Object}
     *   An account object initialized for anonymous.
     *
     */
    getAnonymousAccount(id?: string): User;
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
    v8getUserId(): string | undefined;
    /**
     * Return the current user information, as far as possible.
     *
     * @returns {Object}
     *   A user object, possibly for an anonymous account.
     */
    getUser(): User;
    /**
     * @inheritdoc
     *
     * @see ServerLogger.logExtended()
     */
    process(context: IContext): IContext;
}
export { MeteorUserProcessor, };
