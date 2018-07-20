import {
  testImmutableContext,
  testMessageContext,
  testObjectifyContext,
  testProcessors,
} from "./logContextTest";
import { testConsoleSender } from "./consoleSenderTest";
import { testLogLevelNames, testLogLevels } from "./logLevelsTest";
import { testMeteorUserProcessor } from "./meteorUserProcessorTest";
import { testMongoDbSender } from "./mongodbSenderTest";
import { testSerializeDeepObject } from "./serializationTest";
import { testStrategyConstruction } from "./strategyTest";
import { testStringifyMessage } from "./stringifyTest";
import { testConnect, testConstructor } from "./serverLoggerTest";
import { testBrowserProcessor } from "./browserProcessorTest";

describe("Unit", () => {
  describe("LeveledStrategy", () => {
    describe("reject non-senders in constructor", testStrategyConstruction);
  });
  describe("Logger", () => {
    describe("validate log levels", testLogLevels);
    describe("validate log level names", testLogLevelNames);
    describe("logging does not modify context", testImmutableContext);
    describe("processors can build any context", testProcessors);
  });
  describe("ServerLogger", () => {
    describe("constructor", testConstructor);
    describe("messageContext", testMessageContext);
    describe("objectifyContext", testObjectifyContext);
    describe("setUpConnect", testConnect);
    describe("stringifyMessage", testStringifyMessage);
    describe("serializeDeepObject", testSerializeDeepObject);
  });
  describe("Senders", () => {
    describe("ConsoleSender", testConsoleSender);
    describe("MongoDbSender", testMongoDbSender);
  });
  describe("MeteorUserProcessor", testMeteorUserProcessor);
  describe("BrowserProcessor", testBrowserProcessor);
});
