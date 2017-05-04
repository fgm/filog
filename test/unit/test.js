"use strict";

// Note: to add debug to Sinon matches, look in Sinon call.js, not sinon*.js.

import { testImmutableContext, testMessageContext, testObjectifyContext } from './logContextTest';
import { testLogLevels } from './logLevelsTest';
import { testMeteorUserProcessor } from './meteorUserProcessorTest';
import { testMongoDbSender } from './mongodbSenderTest';
import { testSerializeDeepObject } from './serializationTest';
import { testStrategyConstruction } from './strategyTest';
import { testStringifyMessage } from './stringifyTest';
import { testConstructor } from './serverLoggerTest';

describe("Unit", () => {
  describe("LeveledStrategy", function () {
    describe("reject non-senders in constructor", testStrategyConstruction);
  });
  describe("Logger", function () {
    describe("validate log levels", testLogLevels);
    describe("logging does not modify context", testImmutableContext);
  });
  describe("ServerLogger", function () {
    describe("constructor", testConstructor);
    describe("messageContext", testMessageContext);
    describe("objectifyContext", testObjectifyContext);
    describe("stringifyMessage", testStringifyMessage);
    describe("serializeDeepObject", testSerializeDeepObject);
  });
  describe("MongoDbSender", testMongoDbSender);
  describe("MeteorUserProcessor", testMeteorUserProcessor);
});
