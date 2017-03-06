"use strict";

import "babel-polyfill";

const chai = require("chai");
const chaiHttp = require("chai-http");
const assert = chai.assert;

chai.use(chaiHttp);

import { endPoint } from './harness';

function testValidJson() {
  it("should accept valid JSON posts", done => {
    // Pseudo-random complex value from http://beta.json-generator.com/
    let datum = [
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
            last: "{{surname()}}"
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
              "repeat(5)": "{{lorem(1, 'words')}}"
            }
          ],
          friends: [
            {
              "repeat(3)": {
                id: "{{index()}}",
                name: "{{firstName()}} {{surname()}}"
              }
            }
          ],
          greeting: function (tags) {
            return "Hello, " + this.name.first + "! You have " + tags.integer(5, 10) + " unread messages.";
          },
          favoriteFruit: function (tags) {
            const fruits = ["apple", "banana", "strawberry"];
            return fruits[tags.integer(0, fruits.length - 1)];
          }
        }
      }
    ];

    chai.request(endPoint)
      .post("/logger")
      .set("content-type", "application/json")
      .send(datum)
      .end(function (err, res) {
        assert.equal(err, null, "Valid post does not cause an error");
        assert.equal(res.status, 200, "Valid post is accepted");
        done();
      });
  });
}

function testNonJson() {
  it("should reject non-JSON posts", done => {
    chai.request(endPoint)
      .post("/logger")
      .field("foo", "bar")
      .end(function (err, res) {
        assert.notEqual(err, null);
        assert.equal(res.status, 422);
        done();
      });
  });
}

export {
  testNonJson,
  testValidJson
};
