import "babel-polyfill";
import ServerLogger from "../src/ServerLogger";

const chai = require("chai");
const chaiHttp = require("chai-http");
const assert = chai.assert;

chai.use(chaiHttp);

const endPoint = "http://localhost:3000";

function testObjectifyContext() {
  const objectifyContext = ServerLogger.objectifyContext;

  it("should convert arrays to POJOs", () => {
    const a = ["a", "b"];
    const o = objectifyContext(a);
    assert.equal(typeof o, "object");
    assert.equal(o.constructor.name, "Object");
  });

  it("should convert scalars to POJOs with a value key", () => {
    const scalars = [
      "Hello, world", "",
      42, +0, -0, 0, NaN, -Infinity, +Infinity,
      null,
      true, false,
      // eslint-disable-next-line no-undefined
      undefined
    ];

    scalars.forEach(v => {
      const actual = objectifyContext(v);
      const printable = JSON.stringify(actual);
      assert.equal(typeof actual, "object", `Result type is "object" for ${printable}.`);
      assert.equal(actual.constructor.name, "Object", `Result constructor is "Object" for ${printable}.`);
      const actualKeys = Object.keys(actual);
      assert.equal(actualKeys.length, 1, `Result has a single key for ${printable}.`);
      assert.equal(actualKeys[0], "value", `Result key is called "value" for ${printable}.`);
      assert.isTrue(Object.is(actual.value, v), `Result value is the original value for ${printable}.`);
    });
  });

  it("should not modify existing POJOs", () => {
    const raw = {a: "b"};
    const actual = objectifyContext(raw);
    assert.strictEqual(actual, raw);
  });

  it("should convert date objects to ISO date strings", () => {
    const d = new Date(Date.UTC(2016, 5, 24, 16, 0, 30, 250));
    const actual = objectifyContext(d);
    assert.equal(typeof actual, "string", "Result for date object is a string");
    assert.equal(actual, d.toISOString(), "2016-05-24T16:00:30.250Z : Result is the ISO representation of the date");
  });

  // TODO also check wrapper objects with no keys like new Number(25), new Boolean(true).
  it("should downgrade miscellaneous classed objects to POJOs", () => {
    const value = "foo";
    class Foo {
      constructor(v) {
        this.k = v;
      }
    }
    const initial = new Foo(value);
    assert.equal(typeof initial, "object");
    assert.equal(initial.constructor.name, "Foo");

    const actual = objectifyContext(initial);
    assert.equal(JSON.stringify(Object.keys(actual)), JSON.stringify(["k"]), "Result has same properties as initial object");
    assert.equal(actual.k, value, "Result has same values as initial object");
    assert.equal(typeof actual, "object", "Result is an object");
    assert.equal(actual.constructor.name, "Object", "Result constructor is \"Object\".");
    assert.notStrictEqual(actual, initial, "Result is not the initial object itself.");
    assert.notEqual(actual, initial, "Result is not even equal to the initial object");
  });
}

function testStringifyMessage() {
  const stringify = ServerLogger.stringifyMessage;

  it("should convert strings", () => {
    const value = "foo";

    class Printable {
      constructor(v) {
        this.k = v;
      }

      toString() {
        return JSON.stringify(this.k);
      }
    }

    const o = new Printable(value);

    const expectations = [
      [{message: "foo"}, "foo"],
      [{message: 25}, "25"],
      [{message: o}, JSON.stringify(value)],
      [{}, "{}"],
      [[], "[]"],
      ["foo", "foo"]
    ];

    for (const expectation of expectations) {
      const doc = expectation[0];
      const expected = expectation[1];
      const actual = stringify(doc);
      assert.strictEqual(actual, expected, "Converting " + JSON.stringify(doc));
    }
  });
}

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

function testValidJson() {
  it("should accept valid JSON posts", done => {
    // Pseudo-random complex value from http://beta.json-generator.com/
    let datum = [
      {
        'repeat(5, 10)': {
          _id: '{{objectId()}}',
          index: '{{index()}}',
          guid: '{{guid()}}',
          isActive: '{{bool()}}',
          balance: '{{floating(1000, 4000, 2, "$0,0.00")}}',
          picture: 'http://placehold.it/32x32',
          age: '{{integer(20, 40)}}',
          eyeColor: '{{random("blue", "brown", "green")}}',
          name: {
            first: '{{firstName()}}',
            last: '{{surname()}}'
          },
          company: '{{company().toUpperCase()}}',
          email: function (tags) {
            // Email tag is deprecated, because now you can produce an email as simple as this:
            return (this.name.first + '.' + this.name.last + '@' + this.company + tags.domainZone()).toLowerCase();
          },
          phone: '+1 {{phone()}}',
          address: '{{integer(100, 999)}} {{street()}}, {{city()}}, {{state()}}, {{integer(100, 10000)}}',
          about: '{{lorem(1, "paragraphs")}}',
          registered: '{{moment(this.date(new Date(2014, 0, 1), new Date())).format("LLLL")}}',
          latitude: '{{floating(-90.000001, 90)}}',
          longitude: '{{floating(-180.000001, 180)}}',
          tags: [
            {
              'repeat(5)': '{{lorem(1, "words")}}'
            }
          ],
          friends: [
            {
              'repeat(3)': {
                id: '{{index()}}',
                name: '{{firstName()}} {{surname()}}'
              }
            }
          ],
          greeting: function (tags) {
            return 'Hello, ' + this.name.first + '! You have ' + tags.integer(5, 10) + ' unread messages.';
          },
          favoriteFruit: function (tags) {
            var fruits = ['apple', 'banana', 'strawberry'];
            return fruits[tags.integer(0, fruits.length - 1)];
          }
        }
      }
    ];

    chai.request(endPoint)
      .post('/logger')
      .set('content-type', 'application/json')
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
      .post('/logger')
      .field("foo", "bar")
      .end(function (err, res) {
        assert.notEqual(err, null);
        assert.equal(res.status, 422)
        done();
      });
  });
}

describe("ServerLogger", function () {
  "use strict";
  describe("objectifyContext()", testObjectifyContext);
  describe("stringifyMessage", testStringifyMessage);
  describe("invalidMethod", testInvalidMethod);
  describe("validJson", testValidJson);
  describe("rejectNonJson", testNonJson);
});
