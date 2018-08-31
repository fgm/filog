/** global: Package */
import User = Meteor.User;
/**
 * MeteorUserProcessor adds Meteor account information to log events.
 *
 * @extends ProcessorBase
 */
declare const MeteorUserProcessor: {
    new (meteor?: typeof Meteor, postProcess?: ((r: {}) => {}) | null): {
        platform: string;
        userCache: {
            [key: string]: object;
        };
        meteor: typeof Meteor;
        postProcess: ((r: {}) => {}) | null;
        /**
         * Return a default empty user, with required fill set to empty values.
         *
         * @param {String} id
         *   Optional. A user id.
         * @returns {Object}
         *   An account object initialized for anonymous.
         *
         */
        getAnonymousAccount(id?: number): {
            _id: number;
            emails: never[];
            profile: {};
            services: {};
            username: null;
        };
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
        /** @inheritdoc */
        process(context: object): object;
    };
};
export default MeteorUserProcessor;
