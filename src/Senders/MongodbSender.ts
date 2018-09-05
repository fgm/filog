/**
 * @fileOverview MongoDB Sender class.
 */
import {Mongo} from "meteor/mongo";
import {IContext, TS_KEY} from "../IContext";
import { Logger } from "../Loggers/Logger";
import { ServerSide } from "../Loggers/ServerLogger";
import { SenderBase } from "./SenderBase";

/**
 * MongodbSender sends logs to the Meteor standard database.
 *
 * @extends SenderBase
 */
const MongodbSender = class extends SenderBase {
  public store: Mongo.Collection<object>;

  // noinspection JSClassNamingConvention
  /**
   * @constructor
   *
   * @param {Mongo} mongo
   *   The Meteor Mongo service.
   * @param {(String|Collection)} collection
   *   The collection or the name of the collection in which to log.
   */
  constructor(mongo: any, collection: string|Mongo.Collection<object> = "logger") {
    super();
    if (collection instanceof mongo.Collection) {
      this.store = collection as Mongo.Collection<object>;
    } else if (typeof collection === "string") {
      const collectionName = collection;
      this.store = new mongo.Collection(collectionName);
    } else {
      throw new Error("MongodbSender requires a Collection or a collection name");
    }
  }

  /** @inheritDoc */
  public send(level: number, message: string, context: object): void {
    const defaultedContext: IContext = { ...context, timestamp: {} };
    const doc = { level, message, context: {} as IContext };

    // It should contain a timestamp.{side} object if it comes from any Logger.
    if (typeof defaultedContext[TS_KEY] === "undefined") {
      defaultedContext[TS_KEY] = {
        server: {},
      };
    }
    doc.context = defaultedContext;

    // doc.context.timestamp.server is known to exist from above.
    Logger.stamp(doc.context, "send", ServerSide);
    this.store.insert(doc);
  }
};

export default MongodbSender;
