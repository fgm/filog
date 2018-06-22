import MeteorUserProcessor from "../../src/Processors/MeteorUserProcessor";
import ServerLogger from "../../src/ServerLogger";

function testMeteorUserProcessor() {
  const mockMeteor = { isServer: true };
  const mockAccountsPackage = { "accounts-base": { AccountsServer: true } };
  const SIDE = ServerLogger.side;

  const postProcessorDelete = data => {
    let result = Object.assign({}, data);
    delete result.server.user.services;
    return result;
  };

  const forcedUserId = 42;
  const postProcessorUpdate = data => {
    let result = Object.assign({}, data);
    result.server.user = forcedUserId;
    return result;
  };

  test("should accept a collection name", () => {
    const data = {
      anything: "goes",
      // Actual contexts always have a "source" top-level key, added by
      // Logger.log() before invoking buildContext().
      "source": SIDE,
    };
    global.Package = mockAccountsPackage;
    const processorRaw = new MeteorUserProcessor(mockMeteor);
    const processorDeletor = new MeteorUserProcessor(mockMeteor, postProcessorDelete);
    const processorUpdater = new MeteorUserProcessor(mockMeteor, postProcessorUpdate);
    delete global.PACKAGE;

    expect(processorRaw).toBeInstanceOf(MeteorUserProcessor);
    const resultRaw = processorRaw.process(data);
    expect(resultRaw).toHaveProperty(SIDE);
    expect(resultRaw[SIDE].user.services).toBeDefined();

    expect(processorDeletor).toBeInstanceOf(MeteorUserProcessor);
    const resultDeleted = processorDeletor.process(data);
    expect(resultDeleted[SIDE].user.services).toBeUndefined();

    expect(processorUpdater).toBeInstanceOf(MeteorUserProcessor);
    const resultUpdated = processorUpdater.process(data);
    expect(resultUpdated[SIDE].user).toBe(forcedUserId);
  });
}

export {
  testMeteorUserProcessor,
};
