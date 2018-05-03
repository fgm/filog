import axios from "axios";

import endPoint from "./harness";

function testValidJson() {
  test("should accept valid JSON posts", () => {
    // Pseudo-random complex value from http://beta.json-generator.com/
    let data = [
      {
        "repeat(5, 10)": {
          _id: "{{objectId()}}",
          index: "{{index()}}",
          guid: "{{guid()}}",
          isActive: "{{bool()}}",
          balance: "{{floating(1000, 4000, 2, '$0,0.00')}}",
          picture: "http://placehold.it/32x32",
          age: "{{integer(20, 40)}}",
          eyeColor: "{{random('blue', 'brown', 'green')}}",
          name: {
            first: "{{firstName()}}",
            last: "{{surname()}}",
          },
          company: "{{company().toUpperCase()}}",
          email: function (tags) {
            // Email tag is deprecated, because now you can produce an email as simple as this:
            return (this.name.first + "." + this.name.last + "@" + this.company + tags.domainZone()).toLowerCase();
          },
          phone: "+1 {{phone()}}",
          address: "{{integer(100, 999)}} {{street()}}, {{city()}}, {{state()}}, {{integer(100, 10000)}}",
          about: "{{lorem(1, 'paragraphs')}}",
          registered: "{{moment(this.date(new Date(2014, 0, 1), new Date())).format('LLLL')}}",
          latitude: "{{floating(-90.000001, 90)}}",
          longitude: "{{floating(-180.000001, 180)}}",
          tags: [
            {
              "repeat(5)": "{{lorem(1, 'words')}}",
            },
          ],
          friends: [
            {
              "repeat(3)": {
                id: "{{index()}}",
                name: "{{firstName()}} {{surname()}}",
              },
            },
          ],
          greeting: function (tags) {
            return "Hello, " + this.name.first + "! You have " + tags.integer(5, 10) + " unread messages.";
          },
          favoriteFruit: function (tags) {
            const fruits = ["apple", "banana", "strawberry"];
            return fruits[tags.integer(0, fruits.length - 1)];
          },
        },
      },
    ];

    return axios({
      method: "post",
      baseURL: endPoint,
      url: "/logger",
      data,
      headers: { "content-type": "application/json" },
    }).then(response => {
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
      method: "post",
      baseURL: endPoint,
      url: "/logger",
      data: "42",
      headers: { "content-type": "application/x-www-form-urlencoded" },
    }).catch(err => {
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
