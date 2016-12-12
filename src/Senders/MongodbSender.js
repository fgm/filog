/**
 * @fileOverview MongoDB Sender class.
 */

import * as util from "util";
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
   * @param {Object} formatOptions
   *   Optional : The options used to format the message (default to { depth: 5 }).
   */
  constructor(mongo, collection = "logger", formatOptions = null) {
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

    this.formatOptions = formatOptions || {
      depth: 5,
      rawKeys: []
    };
  }

  send(level, message, context) {
    let defaultedContext = context || {};
    let doc = {level, message};

    // It should contain a timestamp object if it comes from ClientLogger.
    if (typeof defaultedContext.timestamp === "undefined") {
      defaultedContext.timestamp = {};
    }
    doc.context = defaultedContext;
    doc.context.timestamp.store = Date.now();
    try {
      this.store.insert(doc);
    }
    catch (e) {
      doc.context = util.inspect(doc, this.formatOptions);
      this.store.insert(doc);
    }
  }
};

export default MongodbSender;
