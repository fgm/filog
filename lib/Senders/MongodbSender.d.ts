/**
 * @fileOverview MongoDB Sender class.
 */
import { Mongo } from "meteor/mongo";
import { IContext } from "../IContext";
import * as LogLevel from "../LogLevel";
import { ISender } from "./ISender";
/**
 * MongodbSender sends logs to the Meteor standard database.
 */
declare class MongodbSender implements ISender {
    store: Mongo.Collection<object>;
    /**
     * @constructor
     *
     * @param mongo
     *   The Meteor Mongo service.
     * @param collection
     *   The collection or the name of the collection in which to log.
     */
    constructor(mongo: any, collection?: string | Mongo.Collection<object>);
    /** @inheritDoc */
    send(level: LogLevel.Levels, message: string, context: IContext): void;
}
export { MongodbSender, };
