const chai = require("chai");
const assert = chai.assert;
const sinon = require("sinon");

import MongoDbSender from "../../src/Senders/MongodbSender";

function testMongoDbSender() {
  const mongo = {
    Collection: function (name) {
      this.insert = () => {};
      this.name = name;
    }
  };
  it("should accept a collection name", function () {
    const spy = sinon.spy(mongo, 'Collection');
    const sender = new MongoDbSender(mongo, 'some_collection');
    assert.instanceOf(sender, MongoDbSender);
    assert.equal(spy.calledOnce, true);
  });
  it("should accept an existing collection", function () {
    const collection = new mongo.Collection("fake");
    const sender = new MongoDbSender(mongo, collection);
    assert.instanceOf(sender, MongoDbSender);
    assert.equal(sender.store, collection);
  });
  it("should reject invalid collection values", function () {
    const collection = 25;
    assert.throw(() => {
      //noinspection Eslint
      new MongoDbSender(mongo, collection);
    }, Error);
  });
  it("should add a \"store\" timestamp to empty context", function () {
    const collection = new mongo.Collection("fake");
    const sender = new MongoDbSender(mongo, collection);
    const insertSpy = sinon.spy(sender.store, "insert");
    const before = +new Date();
    const inboundArgs = [0, "message", {}];

    sender.send(...inboundArgs);
    const after = +new Date();
    assert.equal(insertSpy.calledOnce, true, "Collection.insert was called once.");
    const callArgs = insertSpy.firstCall.args[0];
    assert.equal(callArgs.level, inboundArgs[0], "Level is passed");
    assert.equal(callArgs.message, inboundArgs[1], "Level is passed");
    const timestamp = callArgs.context.timestamp.store;
    assert.equal(typeof timestamp, "number", "A numeric store timestamp is passed");
    assert.equal(timestamp >= before, true, "Timestamp is later than 'before'");
    assert.equal(timestamp <= after, true, "Timestamp is earlier than 'after'");
  });
  it("should add a \"store\" timestamp to non-empty context", function () {
    const collection = new mongo.Collection("fake");
    const sender = new MongoDbSender(mongo, collection);
    const insertSpy = sinon.spy(sender.store, "insert");
    const before = +new Date();
    const inboundArgs = [0, "message", { timestamp: { whatever: 1480849124018 } }];

    sender.send(...inboundArgs);
    const after = +new Date();
    assert.equal(insertSpy.calledOnce, true, "Collection.insert was called once.");
    const callArgs = insertSpy.firstCall.args[0];
    assert.equal(callArgs.level, inboundArgs[0], "Level is passed");
    assert.equal(callArgs.message, inboundArgs[1], "Level is passed");
    const timestamp = callArgs.context.timestamp.store;
    assert.equal(typeof timestamp, "number", "A numeric store timestamp is passed");
    assert.equal(timestamp >= before, true, "Timestamp is later than 'before'");
    assert.equal(timestamp <= after, true, "Timestamp is earlier than 'after'");
  });
}

export {
  testMongoDbSender
};
