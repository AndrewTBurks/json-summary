let JsonSummary = require("./index");

let summarizer = new JsonSummary({arraySampleCount: 0});

test("handles string", () => {
  let object = "Test";

  let summary = summarizer.summarize(object);

  expect(summary).toEqual({
    "example": "Test",
    "type": "string",
    "count": 1,
    "range": [4, 4]
  });
});

test("handles number", () => {
  let object = 20.2;

  let summary = summarizer.summarize(object);

  expect(summary).toEqual({
    example: 20.2,
    type: "number",
    "count": 1,
    "range": [20.2, 20.2]
  });
});

test("handles boolean", () => {
  let object = true;

  let summary = summarizer.summarize(object);

  expect(summary).toEqual({
    count: 1,
    example: true,
    type: "boolean"
  });
});

test("handles null", () => {
  let object = null;

  let summary = summarizer.summarize(object);

  expect(summary).toEqual({
    count: 1,
    example: null,
    type: "object"
  });
});

test("handles undefined", () => {
  let object = undefined;

  let summary = summarizer.summarize(object);

  expect(summary).toEqual({
    count: 1,
    example: undefined,
    type: "undefined"
  });
});

test("handles array", () => {
  let object = ["a", "b", "c"];

  let summary = summarizer.summarize(object);

  expect(summary).toEqual({
    count: 1,
    items: {
      0: {
        count: 1,
        example: "a",
        type: "string",
        range: [1, 1]
      }
    },
    length: 3,
    type: "Array"
  });
});

test('handles object', () => {
  let object = { a: 1 };

  let summary = summarizer.summarize(object);

  expect(summary).toEqual({
    "count": 1,
    "items": {a: {count: 1, type: "number", range: [1, 1], example: 1}},
    "keys": ["a"],
    "type": "Object"
  });
});

test("handles circular reference", () => {
  let object = {"x": 1};
  object.y = object;

  let summary = summarizer.summarize(object);

  expect(summary).toEqual({
    count: 1,
    items: {
      "x": {
        count: 1,
        example: 1,
        type: "number",
        range: [1, 1]
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

test("handles empty array", () => {
  let object = {
    a: []
  };

  let summary = summarizer.summarize(object);

  expect(summary).toEqual({
    count: 1,
    items: {
      a: {
        count: 1,
        length: 0,
        type: "Array"
      }
    },
    keys: ["a"],
    type: "Object"
  });
});