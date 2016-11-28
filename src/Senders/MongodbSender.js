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
   * @param {String} collectionName
   *   The name of the collection in which to log.
   */
  constructor(mongo, collectionName = "logger") {
    super();
    this.mongo = mongo;
    const collection = new mongo.Collection(collectionName);
    this.store = collection
      ? collection
      : new this.mongo.Collection(collectionName);
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
