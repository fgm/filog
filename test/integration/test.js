import { testInvalidMethod } from './httpMethodTest';
import { testNonJson, testValidJson } from './jsonTest';

describe("Integration", () => {
  describe("ServerLogger", function () {
    describe("invalidMethod", testInvalidMethod);
    describe("validJson", testValidJson);
    describe("rejectNonJson", testNonJson);
  });
});
