let defaults = require("./defaults");

let defaultPrintOpt = {
  indentation: defaults.indentation, // or "\t"
  indentCount: defaults.indentCount,
  showExampleValue: defaults.showExampleValue,
  startExpanded: defaults.startExpanded,
  theme: defaults.theme
};

// utility function to stringify the summary output from summarizeJSON
function printSummarizedJSON(
  summary,
  {
    indentation = defaultPrintOpt.indentation, // or "\t"
    indentCount = defaultPrintOpt.indentCount,
    showExampleValue = defaultPrintOpt.showExampleValue,
    startExpanded = defaultPrintOpt.startExpanded,
    theme = defaultPrintOpt.theme
  } = defaultPrintOpt
) {
  // start at 0 indentation
  return (
    `<div class='json-summary-wrapper ${theme}'>` +
    printSummaryLevel(summary, 0, 1) +
    `<div>`
  );


  function printSummaryLevel(data, l, prevCount) {
    let string = "";

    if (data.circular) {
      string += wrapInHTML("(circular reference)", "circular");
    } else if (data.type === "Object") {
      string += "{";

      let keys = data.keys.map(k => `'${k}'`).join(", ");

      string += wrapInHTML(keys, "keys");

      let childStrings = data.keys.map(key => {
        return printSummaryLevel(data.items[key], l + 1, data.count);
      });

      if (childStrings.length) {
        let childStringCombined = "\n";

        for (let i = 0; i < data.keys.length; i++) {
          childStringCombined += indentation.repeat((l + 1) * indentCount);

          childStringCombined += wrapInHTML(data.keys[i], "name") + ": ";

          if (data.count > 1) {
            childStringCombined += htmlPercentageBar(
              (data.items[data.keys[i]].count / data.count) * 100
            );
          }

          childStringCombined += childStrings[i];

          if (i < data.keys.length - 1) {
            childStringCombined += ",";
          }

          childStringCombined += "\n";
        }

        childStringCombined += indentation.repeat(l * indentCount);

        string += wrapInHTML(childStringCombined, "child");
      }

      string += "}";

      string = wrapInHTML(string, "layer");
    } else if (data.type === "Array") {
      // string += "[]";
      // string += `[ ${data.length ? `(${data.length}×)` : "∅"} `;
      string +=
        wrapInHTML(
          data.count > 1 ? "μ = " + data.length.toFixed(1) : data.length,
          "length"
        ) + ` [`;

      if (data.length) {
        let needsNewlines =
          data.items["0"].type === "Object" || data.items["0"].type === "Array";

        if (needsNewlines) {
          string += "\n" + indentation.repeat((l + 1) * indentCount);
        }

        string += printSummaryLevel(data.items["0"], l + 1, data.count);

        if (needsNewlines) {
          string += "\n" + indentation.repeat(l * indentCount);
        }
      }

      string += "]";

      // string = wrapInHTML(string, "layer");
    } else {
      if (data.example == null || data.example == undefined) {
        string += wrapInHTML("?", "type");
      } else {
        string += wrapInHTML(data.type, "type");
      }

      if (showExampleValue) {
        string += wrapInHTML(data.example, "value", data.type);
        data.count > 1 &&
          data.range &&
          (string += wrapInHTML(data.range, "range", data.type));
      }
    }

    return string;
  }

  function wrapInHTML(value, role, type) {
    let tags = {
      type: () =>
        `<span class="json-summary json-summary-type json-summary-type-${value}">&lt;${value}&gt;</span>`,
      value: () =>
        `<span class="json-summary json-summary-value json-summary-value-${type}">${value}</span>`,
      range: () =>
        `<span class="json-summary json-summary-range json-summary-range-${type}">[${
          value[0]
        }, ${value[1]}]</span>`,
      name: () => `<span class="json-summary json-summary-name">${value}</span>`,
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
      child: () => `<div class="json-summary json-summary-child">${value}</div>`,
      keys: () => `<span class="json-summary json-summary-keys">${value}</span>`
    };

    return tags[role]();
  }

  function htmlPercentageBar(percentage) {
    return `<div class="json-summary json-summary-bar" title="${percentage.toFixed(
      2
    )}%"><div class="json-summary json-summary-percentage" style="width:${percentage}%;"></div></div>`;
  }
}

module.exports = printSummarizedJSON;