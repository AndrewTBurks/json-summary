// https://andrewtburks.dev/json-summary v1.1.0 Copyright 2020 Andrew Burks
(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
typeof define === 'function' && define.amd ? define(factory) :
(global = global || self, global.jsonSummary = factory());
}(this, function () { 'use strict';

let arraySampleCount = 10,
indentation = " ", // or "\t"
indentCount = 2,
showExampleValue = true,
startExpanded = false,
theme = "dark";

var defaults = /*#__PURE__*/Object.freeze({
arraySampleCount: arraySampleCount,
indentation: indentation,
indentCount: indentCount,
showExampleValue: showExampleValue,
startExpanded: startExpanded,
theme: theme
});

// utility function to extract overall json structure without printing entire data object
function summarizeJSON(data, {
  arraySampleCount: arraySampleCount$1 = arraySampleCount
} = defaults) {
  let summary = summarizeItem(data);

  // clean up the marking
  unmarkObject(data);

  return summary;
  

  function summarizeItem(item) {
    let summarize = {
      Array: arr => {
        let summarized = {
          count: 1,
          type: "Array",
          length: arr.length
        };

        // recurse to items in the array
        if (arr.length) {
          if (arraySampleCount$1 > 0) {
            let numToSample = arraySampleCount$1 === "all" ? arr.length : Math.min(arraySampleCount$1, arr.length);
            let sampledItems = {};

            // summarized.count = numToSample;
  
            while (numToSample > 0) {
              let sampleIndex = Math.floor(Math.random() * arr.length);
  
              if (!sampledItems.hasOwnProperty(sampleIndex)) {
                sampledItems[sampleIndex] = arr[sampleIndex];
                numToSample--;
              }
            }

            let summarizedSamples = [];

            for (let pair of Object.entries(sampledItems)) {
              let item = pair[1];

              summarizedSamples.push(summarizeItem(item));
            }

            let joinedSample = joinSampledArray(summarizedSamples);

            summarized.items = {
              0: joinedSample
            };
          } else {
            // sumamrized.count = 1;
            summarized.items = {
              0: summarizeItem(arr[0])
            };
          }

        } else {
          summarized.items = {
            0: undefined
          };
        }

        return summarized;
      },
      Object: obj => {
        let summarized = {
          count: 1,
          type: "Object",
          keys: Object.keys(obj),
          items: {}
        };

        for (let key of summarized.keys) {
          summarized.items[key] = summarizeItem(obj[key]);
        }

        return summarized;
      },
      Other: data => {
        let range;

        if (typeof data === "string") {
          range = [data.length, data.length];
        } else if (typeof data === "number") {
          range = [data, data];
        }

        return {
          type: typeof data,
          example: data,
          count: 1,
          range
        };
      }
    };

    let type = "Other";

    if (item instanceof Array) {
      type = "Array";
    } else if (item instanceof Object) {
      type = "Object";
    }

    if (item && item["*snippets_mark*"]) {
      return {
        type: type,
        circular: true
      };
    } else {
      // marked as visited to make sure it doesn't hit a circular structure
      if (type !== "Other") {
        Object.defineProperty(item, "*snippets_mark*", {
          enumerable: false,
          writable: true,
          configurable: true
        });
        item["*snippets_mark*"] = true;
      }

      return summarize[type](item);
    }
  }

  function joinSampledArray(itemset) {
    // let type = itemset.map(d => d.type)
    //   .reduce((a, type) => {
    //     a[type] = [];
    //     return a;
    //   }, {});

    // for (let item of itemset) {
    //   type[item.type].push(item);
    // }

    // let joins = {};

    // for (let [t, itemset] of Object.entries(type)) {
    //   joins[t] = joinItems(itemset, t);
    // }

    // console.log(joins);

    // return 

    // assume theyre all a matching type

    let joinableTypes = {Array: true, Object: true, boolean: true, string: true, number: true};
    let items = itemset.filter(i => joinableTypes[i.type]);

    if (items.length) {
      let type = items[0].type;
      return joinItems(items.filter(i => i.type === type), type);
    } else {
      // idk - no items to join?
      return {
        count: 0
      };
    }

  }

  function joinItems(itemArr, type) {
    itemArr = itemArr.filter(i => i.type === type);

    // functions to join items by type
    let joiner = {
      string: function(items) {
        // string length range
        let min = items.reduce((acc, item) => {
          return Math.min(acc, item.range[0]);
        }, Infinity);

        let max = items.reduce((acc, item) => {
          return Math.max(acc, item.range[1]);
        }, -Infinity);

        let joinedString = {
          type: "string",
          example: items[0].example,
          range: [min, max],
          count: items.reduce((a, i) => a + i.count, 0)
        };

        return joinedString;
      },
      number: function(items) {
        let min = items.reduce((acc, item) => {
          return Math.min(acc, item.range[0]);
        }, Infinity);

        let max = items.reduce((acc, item) => {
          return Math.max(acc, item.range[1]);
        }, -Infinity);

        let joinedNumber = {
          type: "number",
          example: items[0].example,
          range: [min, max],
          count: items.reduce((a, i) => a + i.count, 0)
        };

        return joinedNumber;
      },
      boolean: function(items) {
        return {
          type: "boolean",
          example: items[0].example,
          count: items.reduce((a, i) => a + i.count, 0)
        };
      },
      Object: function(items) {
        let masterKeys = {};

        for (let obj of items) {
          if (!obj.circular) {
            for (let key of obj.keys) {
              !masterKeys[key] && (masterKeys[key] = []);

              masterKeys[key].push(obj.items[key]);
            }
          }
        }

        let joinedObject = { type: "Object", keys: [], items: {}, count: items.length };

        for (let key of Object.keys(masterKeys)) {
          joinedObject.keys.push(key);

          joinedObject.items[key] = joinSampledArray(masterKeys[key]);
        }

        return joinedObject;
      },
      Array: function(items) {
        let joinedValues = joinSampledArray(items.map(i => i.items[0]).filter(i => i));

        let joinedArray = {
          count: items.length,
          items: {
            0: joinedValues
          },
          length: joinedValues.count / items.length,
          type: "Array"
        };

        return joinedArray;
      }
    };

    return joiner[type](itemArr);
  }

  function unmarkObject(obj) {
    if (obj && obj["*snippets_mark*"]) {
      delete obj["*snippets_mark*"];

      // recurse to the next level
      if (obj instanceof Array && obj.length) {
        unmarkObject(obj[0]);
      } else if (obj instanceof Object) {
        for (let key of Object.keys(obj)) {
          unmarkObject(obj[key]);
        }
      }
    }
  }
}

// let defaults = require("./defaults");

// let defaultPrintOpt = {
//   indentation: defaults.indentation, // or "\t"
//   indentCount: defaults.indentCount,
//   showExampleValue: defaults.showExampleValue,
//   startExpanded: defaults.startExpanded,
//   theme: defaults.theme
// };

// utility function to stringify the summary output from summarizeJSON
function printSummarizedJSON(
  summary,
  {
    indentation: indentation$1 = indentation, // or "\t"
    indentCount: indentCount$1 = indentCount,
    showExampleValue: showExampleValue$1 = showExampleValue,
    startExpanded: startExpanded$1 = startExpanded,
    theme: theme$1 = theme,
    asText = false,
  } = defaults
) {
  // start at 0 indentation
  if (asText) {
    return printSummaryLevel(summary, 0);
  } else {
    return (
      `<div class="theme ${theme$1}"><div class='json-summary-wrapper'>` +
      printSummaryLevel(summary, 0) +
      `<div></div>`
    );
  }

  function printSummaryLevel(data, l) {
    let string = "";

    if (data.circular) {
      string += wrap("(circular reference)", "circular");
    } else if (data.type === "Object") {
      string += "{";

      let keys = data.keys.map((k) => `'${k}'`).join(", ");

      string += wrap(keys, "keys");

      let childStrings = data.keys.map((key) => {
        return printSummaryLevel(data.items[key], l + 1);
      });

      if (childStrings.length) {
        let childStringCombined = "\n";

        for (let i = 0; i < data.keys.length; i++) {
          childStringCombined += indentation$1.repeat((l + 1) * indentCount$1);

          childStringCombined += wrap(data.keys[i], "name") + ": ";

          if (data.count > 1) {
            if (asText) {
              childStringCombined +=
                ((data.items[data.keys[i]].count / data.count) * 100).toFixed(
                  2
                ) + "% ";
            } else {
              childStringCombined += htmlPercentageBar(
                (data.items[data.keys[i]].count / data.count) * 100
              );
            }
          }

          childStringCombined += childStrings[i];

          if (i < data.keys.length - 1) {
            childStringCombined += ",";
          }

          childStringCombined += "\n";
        }

        childStringCombined += indentation$1.repeat(l * indentCount$1);

        string += wrap(childStringCombined, "child");
      }

      string += "}";

      string = wrap(string, "layer");
    } else if (data.type === "Array") {
      // string += "[]";
      // string += `[ ${data.length ? `(${data.length}×)` : "∅"} `;
      string +=
        wrap(
          data.count > 1 ? "μ = " + data.length.toFixed(1) : data.length,
          "length"
        ) + ` [`;

      if (data.length) {
        let needsNewlines =
          data.items["0"].type === "Object" || data.items["0"].type === "Array";

        if (needsNewlines) {
          string += "\n" + indentation$1.repeat((l + 1) * indentCount$1);
        }

        string += printSummaryLevel(data.items["0"], l + 1, data.count);

        if (needsNewlines) {
          string += "\n" + indentation$1.repeat(l * indentCount$1);
        }
      }

      string += "]";

      // string = wrapInHTML(string, "layer");
    } else {
      if (data.example == null || data.example == undefined) {
        string += wrap("?", "type");
      } else {
        string += wrap(data.type, "type");
      }

      if (showExampleValue$1) {
        string += wrap(data.example, "value", data.type);
        data.count > 1 &&
          data.range &&
          (string += wrap(data.range, "range", data.type));
      }
    }

    return string;
  }

  function wrap(value, role, type) {
    if (asText) {
      return wrapAsText(value, role, type);
    } else {
      return wrapInHTML(value, role, type);
    }
  }

  function wrapInHTML(value, role, type) {
    let tags = {
      type: () =>
        `<span class="json-summary json-summary-type json-summary-type-${value}">&lt;${value}&gt;</span>`,
      value: () =>
        `<span class="json-summary json-summary-value json-summary-value-${type}">${value}</span>`,
      range: () =>
        `<span class="json-summary json-summary-range json-summary-range-${type}">[${value[0]}, ${value[1]}]</span>`,
      name: () =>
        `<span class="json-summary json-summary-name">${value}</span>`,
      length: () =>
        `<span class="json-summary json-summary-length">(${value})</span>`,
      circular: () =>
        `<span class="json-summary json-summary-circular">${value}</span>`,
      layer: () => `<span class="json-summary json-summary-checkbox ${
        startExpanded$1 ? "checked" : ""
      }">
              <input type="checkbox" ${startExpanded$1 ? "checked" : ""}>
              <span class="json-summary-checkboxmarker" onclick="(function(me){
                me.parentNode.classList.toggle('checked');
              })(this)"></span>
            </span><div class="json-summary json-summary-layer">${value}</div>`,
      child: () =>
        `<div class="json-summary json-summary-child">${value}</div>`,
      keys: () =>
        `<span class="json-summary json-summary-keys">${value}</span>`,
    };

    return tags[role]();
  }

  function wrapAsText(value, role, type) {
    switch (role) {
      case "type":
        return `<${value}>`;
      case "length":
        return `(${value})`;
      case "layer":
        return value;
      // case "value":
      // case "keys":
      // case "range":
      //   return ` ${type === "string" ? "len:" : "val:"} [${value[0]}, ${
      //     value[1]
      //   }]`;
      case "name":
      case "child":
      case "circular":
        return ` ${value}`;
      default:
        return "";
    }
  }

  function htmlPercentageBar(percentage) {
    return `<div class="json-summary json-summary-bar" title="${percentage.toFixed(
      2
    )}%"><div class="json-summary json-summary-percentage" style="width:${percentage}%;"></div></div>`;
  }
}
// module.exports = printSummarizedJSON;

// https://andrewtburks.dev/json-summary Copyright 2019 Andrew Burks

var index = {
  defaults,
  summarize: summarizeJSON,
  printSummary: printSummarizedJSON
};

return index;

}));
