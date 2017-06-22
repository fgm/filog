const chai = require("chai");
const assert = chai.assert;

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

  it("should accept a collection name", function () {
    const data = { anything: "goes" };
    global.Package = mockAccountsPackage;
    const processorRaw = new MeteorUserProcessor(mockMeteor);
    const processorDeletor = new MeteorUserProcessor(mockMeteor, postProcessorDelete);
    const processorUpdater = new MeteorUserProcessor(mockMeteor, postProcessorUpdate);
    delete(global.PACKAGE);

    assert.instanceOf(processorRaw, MeteorUserProcessor);
    const resultRaw = processorRaw.process(data);
    assert.isDefined(resultRaw.meteor.user.services);

    assert.instanceOf(processorDeletor, MeteorUserProcessor);
    const resultDeleted = processorDeletor.process(data);
    assert.isUndefined(resultDeleted.meteor.user.services);

    assert.instanceOf(processorUpdater, MeteorUserProcessor);
    const resultUpdated = processorUpdater.process(data);
    assert.equal(resultUpdated.meteor.user, forcedUserId);
  });

}

export {
  testMeteorUserProcessor
};
