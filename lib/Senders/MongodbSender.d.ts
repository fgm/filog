/**
 * @fileOverview MongoDB Sender class.
 */
import { Mongo } from "meteor/mongo";
/**
 * MongodbSender sends logs to the Meteor standard database.
 *
 * @extends SenderBase
 */
declare const MongodbSender: {
    new (mongo: any, collection?: string | Mongo.Collection<object>): {
        store: Mongo.Collection<object>;
        /** @inheritDoc */
        send(level: number, message: string, context: object): void;
    };
};
export default MongodbSender;
