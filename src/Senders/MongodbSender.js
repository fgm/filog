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
   * @param {ProcessorBase[]} processors
   *   Processors to be applied by this sender instead of globally.
   * @param {Mongo} mongo
   *   The Meteor Mongo service.
   * @param {(String|Collection)} collection
   *   The collection or the name of the collection in which to log.
   * @param {Object} formatOptions
   *   Optional : The options used to format the message (default to { depth: 5 }).
   */
  constructor(processors = [], mongo, collection = "logger", formatOptions = null) {
    super(processors);
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
    const defaultedContext = context || {};
    const processedContext = super.send(level, message, defaultedContext);
    let doc = { level, message };

    const serializedContext = this.serializeContext(processedContext);

    // It should contain a timestamp object if it comes from ClientLogger.
    if (typeof serializedContext.timestamp === "undefined") {
      serializedContext.timestamp = {};
    }
    doc.context = serializedContext;
    doc.context.timestamp.store = Date.now();
    try {
      this.store.insert(doc);
    }
    catch (e) {
      doc.context = util.inspect(doc, this.formatOptions);
      this.store.insert(doc);
    }
    return serializedContext;
  }

  /**
   * Serialize the untrusted parts of a context, keeping the trusted ones.
   *
   * @param {object} context
   *   The raw context to semi-serialize.
   *
   * @returns {object}
   *   The context, with the non-trusted keys serialized together under the
   *   "serialized" key.
   */
  serializeContext(context) {
    let cloned = Object.assign({}, context);
    let trusted = {};
    this.processorKeys.forEach((value, index) => {
      trusted[value] = cloned[value];
      delete cloned[value];
    });
    const result = Object.assign(trusted, {
      serialized: JSON.stringify(cloned)
    });
    return result;
  }
};

export default MongodbSender;
