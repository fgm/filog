import { IContext } from "../../src/IContext";
import { ClientSide } from "../../src/Loggers/ClientLogger";
import { ServerSide } from "../../src/Loggers/ServerLogger";
import { IProcessor } from "../../src/Processors/IProcessor";
import { MeteorUserProcessor } from "../../src/Processors/MeteorUserProcessor";

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
  const postProcessorDelete = (data: {}) => {
    const result: { server?: IUserSubContext } = Object.assign({}, data);
    if (result.server) {
      delete result.server.user.services;
    }
    return result;
  };

  const forcedUserId = 42;
  const postProcessorUpdate = (data: {} ) => {
    // Do not use IUserSubContext, we want to validate runtime checks agains
    // invalid user structure, which the TS compiler would not allow.
    const result: { server?: { user?: any }} = Object.assign({}, data);
    if (result.server) {
      result.server.user = forcedUserId;
    }
    return result;
  };

  test("MeteorUserProcess supports post-processors", () => {
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
    const serverSideRaw: IUserSubContext = resultRaw[ServerSide]!;
    expect(serverSideRaw.user.services).toBeDefined();

    expect(processorDeletor).toBeInstanceOf(MeteorUserProcessor);
    const resultDeleted: IMeteorAccountContext = processorDeletor.process(data);
    expect(resultDeleted).toHaveProperty(ServerSide);
    const serverSideDeleted = resultDeleted[ServerSide]!;
    expect(serverSideDeleted.user.services).toBeUndefined();

    expect(processorUpdater).toBeInstanceOf(MeteorUserProcessor);
    const resultUpdated: IMeteorAccountContext = processorUpdater.process(data);
    expect(resultUpdated).toHaveProperty(ServerSide);
    const serverSideUpdated: IUserSubContext = resultUpdated[ServerSide]!;
    expect(serverSideUpdated.user).toBe(forcedUserId);
  });

  test.each([
    [ClientSide, ClientSide, ["user"]],
    [ClientSide, ServerSide, ["user"]],
    [ServerSide, ServerSide, ["server", "user"]],
    // ServerSide, ClientSide : may not happen.
  ])("User data for %s events logged on %s is inserted as '%s'.",
      (source: string|string[], platform: string|string[], path: string|string[]): void => {
    expect(typeof source).toBe("string");
    expect(typeof platform).toBe("string");
    expect(path).toBeInstanceOf(Array);
    const data = {
      anything: "goes",
      source: source as string,
    };
    (global as any).Package = mockAccountsPackage;
    const processorRaw: MeteorUserProcessor = new MeteorUserProcessor(mockMeteor as typeof Meteor);
    processorRaw.platform = platform as string;
    const resultRaw: IMeteorAccountContext = processorRaw.process(data);

    // Tiny subset of lodash get.
    const get = (o: object, strings: string[]) => {
      return strings.reduce((accu, curr) => {
        return typeof accu === "undefined" ? undefined : accu[curr];
      }, o);
    };
    const gotten: any = get(resultRaw, path as string[]);
    expect(gotten).toBeDefined();
  });
}

export {
  testMeteorUserProcessor,
};
