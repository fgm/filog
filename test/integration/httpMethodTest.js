import axios from "axios";

import endPoint from "./harness";

function testInvalidMethod() {
  test("should reject GET requests", () => {
    const url = endPoint + "/logger";

    // toBeDefined() + toBe(405) == 2 assertions.
    expect.assertions(2);
    // ServerLogger rejects GET methods as invalid.
    return axios.get(url)
      .catch(err => {
        const res = err.response;
        expect(res).toBeDefined();
        expect(res.status).toBe(405);
      });
  });
}

export {
  testInvalidMethod,
};
