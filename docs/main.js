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

let s = new jsonSummary();

let sum1 = s.summarize(ex1);

console.log(sum1);

let data1elem = document.getElementById("data1");
let sum1elem = document.getElementById("summary1");

data1elem.innerHTML = JSON.stringify(ex1, null, ' ');
sum1elem.innerHTML = s.printSummary(sum1);