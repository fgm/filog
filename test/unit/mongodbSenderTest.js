const sinon = require("sinon");

import MongoDbSender from "../../src/Senders/MongodbSender";

function testMongoDbSender() {
  const mongo = {
    // Do NOT replace by an arrow function: it breaks the Sinon spy.
    Collection: function (name) {
      this.insert = () => {};
      this.name = name;
    },
  };
  test("should accept a collection name", () => {
    const spy = sinon.spy(mongo, "Collection");
    const sender = new MongoDbSender([], mongo, "some_collection");
    assert.instanceOf(sender, MongoDbSender);
    assert.equal(spy.calledOnce, true);
  });
  test("should accept an existing collection", () => {
    const collection = new mongo.Collection("fake");
    const sender = new MongoDbSender([], mongo, collection);
    assert.instanceOf(sender, MongoDbSender);
    assert.equal(sender.store, collection);
  });
  test("should reject invalid collection values", () => {
    const collection = 25;
    expect(() => new MongoDbSender([], mongo, collection)).toThrowError(Error);
  });
  test("should add a \"store\" timestamp to empty context", () => {
    const collection = new mongo.Collection("fake");
    const sender = new MongoDbSender([], mongo, collection);
    const insertSpy = sinon.spy(sender.store, "insert");
    const before = +new Date();
    const inboundArgs = [0, "message", {}];

    sender.send(...inboundArgs);
    const after = +new Date();
    // Collection.insert was called once.
    expect(insertSpy.calledOnce).toBe(true);

    const callArgs = insertSpy.firstCall.args[0];
    // Level is passed.
    expect(callArgs.level).toBe(inboundArgs[0]);
    // Message is passed.
    expect(callArgs.message).toBe(inboundArgs[1]);

    const timestamp = callArgs.context.timestamp.store;
    // A numeric store timestamp is passed.
    expect(typeof timestamp).toBe("number");
    // Timestamp is later than 'before'.
    expect(timestamp >= before).toBe(true);
    // Timestamp is earlier than 'after'.
    expect(timestamp <= after).toBe(true);
  });
  test("should add a \"store\" timestamp to non-empty context", () => {
    const collection = new mongo.Collection("fake");
    const sender = new MongoDbSender([], mongo, collection);
    const insertSpy = sinon.spy(sender.store, "insert");
    const before = +new Date();
    const inboundArgs = [0, "message", { timestamp: { whatever: 1480849124018 } }];

    sender.send(...inboundArgs);
    const after = +new Date();
    expect(insertSpy.calledOnce).toBe(true, "Collection.insert was called once.");
    const callArgs = insertSpy.firstCall.args[0];
    // Level is passed.
    expect(callArgs.level).toBe(inboundArgs[0]);
    // Message is passed.
    expect(callArgs.message).toBe(inboundArgs[1]);

    const timestamp = callArgs.context.timestamp.store;
    // A numeric store timestamp is passed.
    expect(typeof timestamp).toBe("number");
    // Timestamp is later than 'before'.
    expect(timestamp >= before).toBe(true);
    // Timestamp is earlier than 'after'.
    expect(timestamp <= after).toBe(true);
  });
}

export {
  testMongoDbSender,
};
