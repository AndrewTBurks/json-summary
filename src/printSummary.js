// let defaults = require("./defaults");

import * as defaultPrintOpt from "./defaults";

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
    indentation = defaultPrintOpt.indentation, // or "\t"
    indentCount = defaultPrintOpt.indentCount,
    showExampleValue = defaultPrintOpt.showExampleValue,
    startExpanded = defaultPrintOpt.startExpanded,
    theme = defaultPrintOpt.theme,
    asText = false,
    asJson = false,
  } = defaultPrintOpt
) {
  const sep = asText ? "" : ", ";
  let wasArray,
    prevLevel = 0;

  // start at 0 indentation
  if (asText) {
    return printSummaryLevel(summary, 0);
  } else if (asJson) {
    return JSON.parse(printSummaryLevel(summary, 0));
  } else {
    return (
      `<div class="theme ${theme}"><div class='json-summary-wrapper'>` +
      printSummaryLevel(summary, 0) +
      `<div></div>`
    );
  }

  function printSummaryLevel(data, l) {
    let string = "";

    if (data.circular) {
      string += wrap("(circular reference)", "circular");
    } else if (data.type === "Object") {
      if (!asText) string += "{";

      let keys = data.keys.map((k) => `'${k}'`).join(sep);

      string += wrap(keys, "keys");

      if (l === prevLevel) wasArray = false;
      let childStrings = data.keys.map((key) => {
        return printSummaryLevel(data.items[key], l + 1);
      });

      if (childStrings.length) {
        let childStringCombined = "\n";

        for (let i = 0; i < data.keys.length; i++) {
          childStringCombined += indentation.repeat((l + 1) * indentCount);

          childStringCombined += wrap(data.keys[i], "name") + ": ";

          if (data.count > 1) {
            let pct = (
              (data.items[data.keys[i]].count / data.count) *
              100
            ).toFixed(2);
            if (asJson) childStringCombined += '"';
            if (asText || asJson) {
              childStringCombined += pct + "% ";
            } else {
              childStringCombined += htmlPercentageBar(pct);
            }
          }

          childStringCombined += childStrings[i];

          if (i < data.keys.length - 1) {
            childStringCombined += sep;
          }

          childStringCombined += "\n";
        }

        childStringCombined += indentation.repeat(l * indentCount);

        string += wrap(childStringCombined, "child");
      }

      if (!asText) string += "}";

      string = wrap(string, "layer");
    } else if (data.type === "Array") {
      // string += "[]";
      // string += `[ ${data.length ? `(${data.length}×)` : "∅"} `;
      let needsNewlines =
        data.length &&
        (data.items["0"].type === "Object" || data.items["0"].type === "Array");
      let lenStr =
        wrap(
          data.count > 1 ? "μ = " + data.length.toFixed(1) : data.length,
          "length"
        ) + (!asJson ? ` [` : "");

      if (data.count > 1) lenStr = lenStr.slice(1); // don't put leading quote on the 'mu' =  expression

      if (!needsNewlines || !asJson) string += lenStr;
      if (data.length) {
        if (needsNewlines && asJson) {
          data.items["0"].items["<summary>"] = {
            type: "array",
            example: lenStr.replace(/"/, ""),
            keys: [],
            items: {},
            count: data.items["0"].count,
          };
          data.items["0"].keys.unshift("<summary>");
        }

        string += printSummaryLevel(data.items["0"], l + 1, data.count);

        if (needsNewlines) {
          string += "\n" + indentation.repeat(l * indentCount);
        }
      }

      if (!asJson) string += "]";

      // string = wrapInHTML(string, "layer");
    } else {
      if (data.example == null || data.example == undefined) {
        string += wrap("?", "type");
      } else {
        string += wrap(data.type, "type");
      }

      if (showExampleValue) {
        string += wrap(data.example, "example", data.type);
        data.count > 1 &&
          data.range &&
          (string += wrap(data.range, "range", data.type));
      }
      // if (l !== prevLevel) wasArray = false;
    }

    prevLevel = l;
    return string;
  }

  function wrap(value, role, type) {
    if (asText) {
      return wrapAsText(value, role, type);
    } else if (asJson) {
      return wrapAsJson(value, role, type);
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
        startExpanded ? "checked" : ""
      }">
              <input type="checkbox" ${startExpanded ? "checked" : ""}>
              <span class="json-summary-checkboxmarker" onclick="(function(me){
                me.parentNode.classList.toggle('checked');
              })(this)"></span>
            </span><div class="json-summary json-summary-layer">${value}</div>`,
      child: () =>
        `<div class="json-summary json-summary-child">${value}</div>`,
      keys: () =>
        `<span class="json-summary json-summary-keys">${value}</span>`,
    };

    tags.example = tags.value;
    return tags[role]();
  }

  function wrapAsText(value, role) {
    switch (role) {
      case "type":
        return `<${value}>`;
      case "length":
        return `(${value})`;
      case "layer":
        return value;
      // case "keys":
      // case "range":
      //   return ` ${type === "string" ? "len:" : "val:"} [${value[0]}, ${
      //     value[1]
      //   }]`;
      case "value":
      case "example":
      case "name":
      case "child":
      case "circular":
        return ` ${value}`;
      default:
        return "";
    }
  }

  function wrapAsJson(value, role) {
    const startSep = wasArray ? " " : '"';
    const endSep = showExampleValue ? " " : '"';
    switch (role) {
      case "example":
        return `${value}"`;
      case "type":
        return `${startSep}<${value}>${endSep}`;
      case "length":
        wasArray = true;
        return `"(${value})`;
      case "layer":
      case "value":
      case "child":
        return value;
      case "name":
      case "circular":
        return ` "${value}"`;
      default:
        return "";
    }
  }

  function htmlPercentageBar(percentage) {
    return `<div class="json-summary json-summary-bar" title="${percentage}%"><div class="json-summary json-summary-percentage" style="width:${percentage}%;"></div></div>`;
  }
}

export default printSummarizedJSON;
// module.exports = printSummarizedJSON;
