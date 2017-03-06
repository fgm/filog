"use strict";

const chai = require("chai");
const assert = chai.assert;

import ServerLogger from "../../src/ServerLogger";

const testConstructor = function () {
  const strategy = {
    customizeLogger: () => [],
    selectSenders: () => []
  };

  it("Should provide default parameters", function () {
    const logger = new ServerLogger(strategy);
    assert.equal(logger.logRequestHeaders, true, "logRequestHeaders correctly defaulted");
    assert.equal(logger.servePath, "/logger", "servePath correctly defaulted");
  });

  it("Should not add unknown parameters", function () {
    const logger = new ServerLogger(strategy, null, { foo: "bar" });
    assert.typeOf(logger.foo, "undefined", "Unknown argument foo is not set on instance");
  });

  it("Should not overwrite passed parameters", function () {
    const options = {
      logRequestHeaders: "foo",
      servePath: 42
    };
    const logger = new ServerLogger(strategy, null, options);
    assert.equal(logger.logRequestHeaders, options.logRequestHeaders, "logRequestHeaders not overwritten");
    assert.equal(logger.servePath, options.servePath, "servePath not overwritten");
  });
};

export {
  testConstructor
};
