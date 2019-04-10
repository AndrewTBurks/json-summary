let JsonSummary = require("./dist/json-summary-node");

let summarizer = new JsonSummary();

test("handles string", () => {
  let object = "Test";

  let summary = summarizer.summarize(object);

  expect(summary).toEqual({
    "example": "Test",
    "type": "string"
  });
});

test("handles number", () => {
  let object = 20.2;

  let summary = summarizer.summarize(object);

  expect(summary).toEqual({
    example: 20.2,
    type: "number"
  });
});

test("handles boolean", () => {
  let object = true;

  let summary = summarizer.summarize(object);

  expect(summary).toEqual({
    example: true,
    type: "boolean"
  });
});

test("handles null", () => {
  let object = null;

  let summary = summarizer.summarize(object);

  expect(summary).toEqual({
    example: null,
    type: "object"
  });
});

test("handles undefined", () => {
  let object = undefined;

  let summary = summarizer.summarize(object);

  expect(summary).toEqual({
    example: undefined,
    type: "undefined"
  });
});

test("handles array", () => {
  let object = ["a", "b", "c"];

  let summary = summarizer.summarize(object);

  expect(summary).toEqual({
    items: {
      "0": {
        example: "a",
        type: "string"
      }
    },
    length: 3,
    type: "Array"
  });
});

test('handles object', () => {
  let object = {};

  let summary = summarizer.summarize(object);

  expect(summary).toEqual({
    "items": {},
    "keys": [],
    "type": "Object"
  });
});

test("handles circular reference", () => {
  let object = {"x": 1};
  object.y = object;

  let summary = summarizer.summarize(object);

  expect(summary).toEqual({
    items: {
      "x": {
        example: 1,
        type: "number"
      },
      "y": {
        circular: true,
        type: "Object"
      }
    },
    keys: ["x", "y"],
    type: "Object"
  });
});