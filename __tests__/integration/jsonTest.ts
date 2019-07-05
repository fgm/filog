import axios from "axios";

import endPoint from "./harness";

interface IJsonTestObject {
  integer: (...args: number[]) => number;
  domainZone: () => string;
}

function testValidJson() {
  test("should accept valid JSON posts", () => {
    // Pseudo-random complex value from http://beta.json-generator.com/
    const data = [
      {
        "repeat(5, 10)": {
          _id: "{{objectId()}}",
          about: "{{lorem(1, 'paragraphs')}}",
          address: "{{integer(100, 999)}} {{street()}}, {{city()}}, {{state()}}, {{integer(100, 10000)}}",
          age: "{{integer(20, 40)}}",
          balance: "{{floating(1000, 4000, 2, '$0,0.00')}}",
          company: "{{company().toUpperCase()}}",
          email(tags: IJsonTestObject) {
            // Email tag is deprecated, because now you can produce an email as simple as this:
            return (this.name.first + "." + this.name.last + "@" + this.company + tags.domainZone()).toLowerCase();
          },
          eyeColor: "{{random('blue', 'brown', 'green')}}",
          favoriteFruit(tags: IJsonTestObject) {
            const fruits = ["apple", "banana", "strawberry"];
            return fruits[tags.integer(0, fruits.length - 1)];
          },
          friends: [
            {
              "repeat(3)": {
                id: "{{index()}}",
                name: "{{firstName()}} {{surname()}}",
              },
            },
          ],
          greeting(tags: IJsonTestObject) {
            return "Hello, " + this.name.first + "! You have " + tags.integer(5, 10) + " unread messages.";
          },
          guid: "{{guid()}}",
          index: "{{index()}}",
          isActive: "{{bool()}}",
          latitude: "{{floating(-90.000001, 90)}}",
          longitude: "{{floating(-180.000001, 180)}}",
          name: {
            first: "{{firstName()}}",
            last: "{{surname()}}",
          },
          phone: "+1 {{phone()}}",
          picture: "http://placehold.it/32x32",
          registered: "{{moment(this.date(new Date(2014, 0, 1), new Date())).format('LLLL')}}",
          tags: [
            {
              "repeat(5)": "{{lorem(1, 'words')}}",
            },
          ],
        },
      },
    ];

    return axios({
      baseURL: endPoint,
      data,
      headers: { "content-type": "application/json" },
      method: "post",
      url: "/logger",
    }).then((response) => {
      // Valid post is accepted.
      expect(response.status).toBe(200);
    });
  });
}

function testNonJson() {
  test("should reject non-JSON posts", () => {
    // Ensure fail if the promise resolves.
    expect.assertions(2);

    return axios({
      baseURL: endPoint,
      data: "42",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      method: "post",
      url: "/logger",
    }).catch((err) => {
      const response = err.response;
      expect(response).toBeDefined();
      // Invalid JSON is rejected.
      expect(response.status).toBe(422);
    });
  });
}

export {
  testNonJson,
  testValidJson,
};
