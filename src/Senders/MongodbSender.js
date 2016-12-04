/**
 * @fileOverview MongoDB Sender class.
 */
import SenderBase from "./SenderBase";

/**
 * MongodbSender sends logs to the Meteor standard database.
 *
 * @extends SenderBase
 */
const MongodbSender = class extends SenderBase {
  // noinspection JSClassNamingConvention
  /**
   * @constructor
   *
   * @param {Mongo} mongo
   *   The Meteor Mongo service.
   * @param {(String|Collection)} collection
   *   The collection or the name of the collection in which to log.
   */
  constructor(mongo, collection = "logger") {
    super();
    if (collection instanceof mongo.Collection) {
      this.store = collection;
    }
    else if (typeof collection === "string") {
      const collectionName = collection;
      this.store = new mongo.Collection(collectionName);
    }
    else {
      throw new Error("MongodbSender requires a Collection or a collection name");
    }
  }

  send(level, message, context) {
    let defaultedContext = context || {};
    let doc = { level, message };

    // It should contain a timestamp object if it comes from ClientLogger.
    if (typeof defaultedContext.timestamp === "undefined") {
      defaultedContext.timestamp = {};
    }
    doc.context = defaultedContext;
    doc.context.timestamp.store = Date.now();
    this.store.insert(doc);
  }
};

export default MongodbSender;
