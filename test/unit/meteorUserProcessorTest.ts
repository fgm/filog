import MeteorUserProcessor from "../../src/Processors/MeteorUserProcessor";

function testMeteorUserProcessor() {
  const mockMeteor = { isServer: true };
  const mockAccountsPackage = { "accounts-base": { AccountsServer: true } };

  const postProcessorDelete = data => {
    let result = Object.assign({}, data);
    delete result.meteor.user.services;
    return result;
  };

  const forcedUserId = 42;
  const postProcessorUpdate = data => {
    let result = Object.assign({}, data);
    result.meteor.user = forcedUserId;
    return result;
  };

  test("should accept a collection name", () => {
    const data = { anything: "goes" };
    global.Package = mockAccountsPackage;
    const processorRaw = new MeteorUserProcessor(mockMeteor);
    const processorDeletor = new MeteorUserProcessor(mockMeteor, postProcessorDelete);
    const processorUpdater = new MeteorUserProcessor(mockMeteor, postProcessorUpdate);
    delete global.PACKAGE;

    expect(processorRaw).toBeInstanceOf(MeteorUserProcessor);
    const resultRaw = processorRaw.process(data);
    expect(resultRaw.meteor.user.services).toBeDefined();

    expect(processorDeletor).toBeInstanceOf(MeteorUserProcessor);
    const resultDeleted = processorDeletor.process(data);
    expect(resultDeleted.meteor.user.services).toBeUndefined();

    expect(processorUpdater).toBeInstanceOf(MeteorUserProcessor);
    const resultUpdated = processorUpdater.process(data);
    expect(resultUpdated.meteor.user).toBe(forcedUserId);
  });
}

export {
  testMeteorUserProcessor,
};
