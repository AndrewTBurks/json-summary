"use strict";

import * as defaultSummOpt from "./defaults";

// utility function to extract overall json structure without printing entire data object
function summarizeJSON(data, {
  arraySampleCount = defaultSummOpt.arraySampleCount
} = defaultSummOpt) {
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
          if (arraySampleCount > 0) {
            let numToSample = arraySampleCount === "all" ? arr.length : Math.min(arraySampleCount, arr.length);
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

export default summarizeJSON;