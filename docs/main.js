let ex1 = {
  "name": "val1",
  "data": [
    {"a": 1}, {a: 6, "b": 2}, {"c": 3}
  ],
  "isOk": true,
  "location": {
    "x": 1,
    "y": 2
  }
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
      powers: ["Radiation resistance", "Turning tiny", "Radiation blast"]
    },
    {
      name: "Madame Uppercut",
      age: 39,
      secretIdentity: "Jane Wilson",
      powers: [
        "Million tonne punch",
        "Damage resistance",
        "Superhuman reflexes"
      ]
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
        "Interdimensional travel"
      ]
    }
  ]
};

let ex0 = {
  a: [2, 8, 24],
  b: { x: "y" }
};

let summarizer1 = new jsonSummary({startExpanded: true});

let summary = summarizer1.summarize(ex0);
let sumelem0 = document.getElementById("summary1");
let outelem0 = document.getElementById("output1");
sumelem0.innerHTML = JSON.stringify(summary, null, "  ");
outelem0.innerHTML = summarizer1.printSummary(summary);

addExample(ex1, 2, summarizer1);
addExample(ex2, 3, summarizer1);

function addExample(data, number, s) {
  let summary = s.summarize(data);

  let dataelem = document.getElementById("data" + number);
  // let sumelem = document.getElementById("summary" + number);
  let outelem = document.getElementById("output" + number);

  dataelem.innerHTML = JSON.stringify(data, null, "  ");
  // sumelem.innerHTML = JSON.stringify(summary, null, "  ");
  outelem.innerHTML = s.printSummary(summary);
}

Dropzone.options.upload = {
  url: "#",
  maxFiles: 1,
  acceptedFiles: "application/json",
  accept: function(file, done) {
    console.log("file uploaded");

    console.log(file);

    var reader = new FileReader();
    reader.readAsText(file, "UTF-8");

    reader.onload = function(evt) {
      try {
        let sum = new jsonSummary({arraySampleCount: 50, startExpanded: true});
        let data = JSON.parse(evt.target.result);
        console.log(data);

        let outElem = document.getElementById("outputUser");

        let summary = sum.summarize(data);

        outElem.innerHTML = sum.printSummary(summary);
      } catch (err) {
        console.log("error parsing JSON");
      }
    };
    reader.onerror = function(evt) {
      console.log("error reading file");
    };
  }
};