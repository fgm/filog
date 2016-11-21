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
   * @param {(String|Collection)} Collection or collection name
   *   The collection or the name of the collection in which to log.
   */
  constructor(mongo, collection = "logger") {
    super();
    this.mongo = mongo;
    if (typeof collection === "object") {
      this.store = collection;
    } else if (typeof collection === "string") {
      const collectionName = collection;
      const newCollection = new mongo.Collection(collectionName);
      this.store = newCollection
        ? newCollection
        : new this.mongo.Collection(collectionName);
    } else {
      throw new Error('MongodbSender requires a Collection or a collection name');
    }
  }

  send(level, message, context) {
    let doc = { level, message };
    // It should already contain a timestamp object anyway.
    if (typeof context !== "undefined") {
      doc.context = context;
    }
    doc.context.timestamp.store = Date.now();
    this.store.insert(doc);
  }
};

export default MongodbSender;
