/* global jsonSummary, Dropzone */

let globalTheme = "dark";

let ex1 = {
  name: "val1",
  data: [{ a: 1 }, { a: 6, b: 2 }, { b: null, c: 3 }],
  isOk: true,
  location: {
    x: 1,
    y: 2,
  },
};

let ex2 = {
  squadName: "Super hero squad",
  homeTown: "Metro City",
  formed: 2016,
  secretBase: "Super tower",
  active: true,
  members: [
    {
      name: "Molecule Man",
      age: 29,
      secretIdentity: "Dan Jukes",
      powers: ["Radiation resistance", "Turning tiny", "Radiation blast"],
    },
    {
      name: "Madame Uppercut",
      age: 39,
      secretIdentity: "Jane Wilson",
      powers: [
        "Million tonne punch",
        "Damage resistance",
        "Superhuman reflexes",
      ],
    },
    {
      name: "Eternal Flame",
      age: 1000000,
      secretIdentity: "Unknown",
      powers: [
        "Immortality",
        "Heat Immunity",
        "Inferno",
        "Teleportation",
        "Interdimensional travel",
      ],
    },
  ],
};

let ex0 = {
  a: [2, 8, 24],
  b: { x: "y" },
};

let summary = jsonSummary.summarize(ex0);
let sumelem0 = document.getElementById("summary1");
let outelem0 = document.getElementById("output1");
sumelem0.innerHTML = JSON.stringify(summary, null, "  ");
outelem0.innerHTML = jsonSummary.printSummary(summary, {
  startExpanded: true,
  theme: globalTheme,
});

addExample(ex1, 2);
addExample(ex2, 3);

addExample(ex2, 4, true);

function addExample(data, number, asText = false) {
  let summary = jsonSummary.summarize(data);

  let dataelem = document.getElementById("data" + number);
  let outelem = document.getElementById("output" + number);

  dataelem.innerHTML = JSON.stringify(data, null, "  ");

  let summaryString = jsonSummary.printSummary(summary, {
    startExpanded: true,
    theme: globalTheme,
    asText,
  });

  console.log(summary);

  outelem.innerHTML = asText
    ? summaryString.replace(/</gm, "&lt;").replace(/>/gm, "&gt;")
    : summaryString;
}

Dropzone.options.upload = {
  url: "#",
  maxFiles: 1,
  acceptedFiles: "application/json",
  accept: function (file) {
    var reader = new FileReader();
    reader.readAsText(file, "UTF-8");

    reader.onload = function (evt) {
      try {
        let data = JSON.parse(evt.target.result);

        let outElem = document.getElementById("outputUser");

        let summary = jsonSummary.summarize(data, { arraySampleCount: 100 });

        outElem.innerHTML = jsonSummary.printSummary(summary, {
          startExpanded: false,
          theme: globalTheme,
        });
      } catch (err) {
        throw err;
      }
    };
    // reader.onerror = function(evt) {
    //   console.log("error reading file");
    // };
  },
};

// bind interaction with data blocks
let dataBlocks = document.getElementsByClassName("data");

for (let i = 0; i < dataBlocks.length; i++) {
  dataBlocks[i].onclick = function () {
    this.classList.toggle("open");
  };
}

let themeChoices = document.getElementsByClassName("themeChoice");

for (let i = 0; i < themeChoices.length; i++) {
  themeChoices[i].onclick = function (e) {
    e.stopPropagation();
    let themeBlocks = document.getElementsByClassName("theme");
    let codeBlocks = document.getElementsByClassName("code");
    let dataBlocks = document.getElementsByClassName("data");

    globalTheme = this.name;

    for (let j = 0; j < themeBlocks.length; j++) {
      themeBlocks[j].className = "theme " + this.name;
    }

    for (let j = 0; j < codeBlocks.length; j++) {
      codeBlocks[j].className = "code " + this.name;
    }

    for (let j = 0; j < dataBlocks.length; j++) {
      dataBlocks[j].className = "data " + this.name;
    }

    document.body.className = this.name;
  };
}

document.getElementById("themePanel").onclick = function () {
  this.classList.toggle("open");
};
