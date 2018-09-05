import {IContext} from "../../src/IContext";
import {ServerSide} from "../../src/Loggers/ServerLogger";
import {IProcessor} from "../../src/Processors/IProcessor";
import MeteorUserProcessor from "../../src/Processors/MeteorUserProcessor";

interface IUserSubContext {
  user: {
    services: {},
  };
}

interface IMeteorAccountContext extends IContext {
  client?: IUserSubContext;
  cordova?: IUserSubContext;
  server?: IUserSubContext;
}

function testMeteorUserProcessor() {
  const mockMeteor = { isServer: true };
  const mockAccountsPackage = { "accounts-base": { AccountsServer: true } };
  const postProcessorDelete = (data) => {
    const result = Object.assign({}, data);
    delete result.server.user.services;
    return result;
  };

  const forcedUserId = 42;
  const postProcessorUpdate = (data) => {
    const result = Object.assign({}, data);
    result.server.user = forcedUserId;
    return result;
  };

  test("should accept a collection name", () => {
    const data = {
      anything: "goes",
      // Actual contexts always have a "source" top-level key, added by
      // Logger.log() before invoking buildContext().
      source: ServerSide,
    };
    (global as any).Package = mockAccountsPackage;
    const processorRaw: IProcessor = new MeteorUserProcessor(mockMeteor as typeof Meteor);
    const processorDeletor = new MeteorUserProcessor(mockMeteor as typeof Meteor, postProcessorDelete);
    const processorUpdater = new MeteorUserProcessor(mockMeteor as typeof Meteor, postProcessorUpdate);
    delete (global as any).Package;

    expect(processorRaw).toBeInstanceOf(MeteorUserProcessor);
    const resultRaw: IMeteorAccountContext = processorRaw.process(data);
    expect(resultRaw).toHaveProperty(ServerSide);
    expect(resultRaw[ServerSide].user.services).toBeDefined();

    expect(processorDeletor).toBeInstanceOf(MeteorUserProcessor);
    const resultDeleted: IMeteorAccountContext = processorDeletor.process(data);
    expect(resultDeleted[ServerSide].user.services).toBeUndefined();

    expect(processorUpdater).toBeInstanceOf(MeteorUserProcessor);
    const resultUpdated: IMeteorAccountContext = processorUpdater.process(data);
    expect(resultUpdated[ServerSide].user).toBe(forcedUserId);
  });
}

export {
  testMeteorUserProcessor,
};
