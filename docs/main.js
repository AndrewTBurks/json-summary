let ex1 = {
  "key1": "val1",
  "key2": [
    "a", "b", "c"
  ],
  "key3": true,
  "key4": {
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

let s = new jsonSummary();

addExample(ex1, 1);
addExample(ex2, 2);

function addExample(data, number) {
  let summary = s.summarize(data);

  let dataelem = document.getElementById("data" + number);
  let sumelem = document.getElementById("summary" + number);
  let outelem = document.getElementById("output" + number);

  dataelem.innerHTML = JSON.stringify(data, null, "  ");
  sumelem.innerHTML = JSON.stringify(summary, null, "  ");
  outelem.innerHTML = s.printSummary(summary);
}