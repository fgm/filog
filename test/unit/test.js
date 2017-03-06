"use strict";

import { testImmutableContext, testObjectifyContext } from './logContextTest';
import { testLogLevels } from './logLevelsTest';
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
    describe("objectifyContext()", testObjectifyContext);
    describe("stringifyMessage", testStringifyMessage);
    describe("serializeDeepObject", testSerializeDeepObject);
  });
  describe("MongoDbSender", testMongoDbSender);
});
