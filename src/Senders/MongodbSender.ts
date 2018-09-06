/**
 * @fileOverview MongoDB Sender class.
 */
import {Mongo} from "meteor/mongo";
import {IContext, ITimestamps, KEY_TS} from "../IContext";
import {Logger} from "../Loggers/Logger";
import {ServerSide} from "../Loggers/ServerLogger";
import * as LogLevel from "../LogLevel";
import {ISender} from "./ISender";

/**
 * MongodbSender sends logs to the Meteor standard database.
 */
class MongodbSender implements ISender {
  public store: Mongo.Collection<object>;

  // noinspection JSClassNamingConvention
  /**
   * @constructor
   *
   * @param mongo
   *   The Meteor Mongo service.
   * @param collection
   *   The collection or the name of the collection in which to log.
   */
  constructor(mongo: any, collection: string|Mongo.Collection<object> = "logger") {
    if (collection instanceof mongo.Collection) {
      this.store = collection as Mongo.Collection<object>;
    } else if (typeof collection === "string") {
      this.store = new mongo.Collection(collection);
    } else {
      throw new Error("MongodbSender requires a Collection or a collection name");
    }
  }

  /** @inheritDoc */
  public send(level: LogLevel.Levels, message: string, context: IContext): void {
    const defaultedContext: IContext = { ...context, timestamp: {} };
    const doc = { level, message, context: {} as IContext };

    // It should contain a timestamp.{side} object if it comes from any Logger.
    if (typeof defaultedContext[KEY_TS] === "undefined") {
      defaultedContext[KEY_TS] = {
        server: {},
      };
    }
    doc.context = defaultedContext;

    // doc.context.timestamp.server is known to exist from above.
    Logger.stamp(doc.context, "send", ServerSide as keyof ITimestamps);
    this.store.insert(doc);
  }
}

export {
  MongodbSender,
};
