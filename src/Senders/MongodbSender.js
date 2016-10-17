import SenderBase from './SenderBase';

export default class MongodbSender extends SenderBase {
  /**
   * @constructor
   *
   * @param {Mongo} mongo
   *   The Meteor Mongo service.
   * @param {String} collectionName
   *   The name of the collection in which to log.
   */
  constructor(mongo, collectionName = 'logger') {
    super();
    this.mongo = mongo;
    const collection = mongo.Collection.get(collectionName);
    this.store = collection
      ? collection
      : new this.mongo.Collection(collectionName);
  }

  send(level, message, context) {
    let doc = { level, message };
    // It should already contain a timestamp object anyway.
    if (typeof context !== 'undefined') {
      doc.context = context;
    }
    doc.context.timestamp.store = Date.now();
    this.store.insert(doc);
  }
}
