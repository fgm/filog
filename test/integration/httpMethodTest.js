"use strict";

import "babel-polyfill";

const chai = require("chai");
const chaiHttp = require("chai-http");
const assert = chai.assert;

chai.use(chaiHttp);

import { endPoint } from './harness';

function testInvalidMethod() {
  it("should reject GET requests", done => {
    chai.request(endPoint)
      .get("/logger")
      .end((err, res) => {
        assert.equal(res.status, 405, "ServerLogger rejects GET methods as invalid.");
        done();
      });
  });
}

export {
  testInvalidMethod
};
