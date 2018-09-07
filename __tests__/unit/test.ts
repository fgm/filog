import { testBrowserProcessor } from "./browserProcessorTest";
import { testConsoleSender } from "./consoleSenderTest";
import { testContextSourcing } from "./contextSourcingTest";
import {
  testImmutableContext,
  testMessageContext,
  testObjectifyContext,
  testProcessors,
} from "./logContextTest";
import { testLogLevelNames, testLogLevels } from "./logLevelsTest";
import { testMeteorUserProcessor } from "./meteorUserProcessorTest";
import { testMongoDbSender } from "./mongodbSenderTest";
import { testSerializeDeepObject } from "./serializationTest";
import { testBuildContext, testConnect, testConstructor, testLogExtended } from "./serverLoggerTest";
import { testStrategyConstruction } from "./strategyTest";
import { testStringifyMessage } from "./stringifyTest";

describe("Unit", () => {
  describe("LeveledStrategy", () => {
    describe("reject non-senders in constructor", testStrategyConstruction);
  });
  describe("Multiple loggers", () => {
    describe("test context sourcing", testContextSourcing);
  });
  describe("Logger", () => {
    describe("validate log levels", testLogLevels);
    describe("validate log level names", testLogLevelNames);
    describe("logging does not modify context", testImmutableContext);
    // TODO: processors are not yet implemented in this branch.
    describe("processors can build any context", testProcessors);
  });
  describe("ServerLogger", () => {
    describe("constructor", testConstructor);
    describe("buildContext", testBuildContext);
    describe("messageContext", testMessageContext);
    describe("objectifyContext", testObjectifyContext);
    describe("logExtended", testLogExtended);
    describe("setUpConnect", testConnect);
    describe("stringifyMessage", testStringifyMessage);
    describe("serializeDeepObject", testSerializeDeepObject);
  });
  describe("Senders", () => {
    describe("ConsoleSender", testConsoleSender);
    describe("MongodbSender", testMongoDbSender);
  });
  describe("MeteorUserProcessor", testMeteorUserProcessor);
  describe("BrowserProcessor", testBrowserProcessor);
});
