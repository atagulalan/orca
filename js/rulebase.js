// The JS File That Reads & Loads Rulebases to Rulebase.html

function readRuleBase(file, callback) {
  var rawFile = new XMLHttpRequest();
  rawFile.overrideMimeType("application/json");
  rawFile.open("GET", file, true);
  rawFile.onreadystatechange = function() {
    if (rawFile.readyState === 4 && rawFile.status == "200") {
      callback(rawFile.responseText);
    }
  };
  rawFile.send(null);
}

// Reads and gets rulebase.json
readRuleBase("rulebase/rulebase.json", function(text) {
  var json = JSON.parse(text);
  var table = document.createElement("table");

  // Draws the read rulebases
  loadRuleBase(1, null, "Emotion", table, 1);
  loadRuleBase(json.HAPPY.length, json.HAPPY, "HAPPY", table, 0);
  loadRuleBase(json.NEUTRAL.length, json.NEUTRAL, "NEUTRAL", table, 0);
  loadRuleBase(json.SAD.length, json.SAD, "SAD", table, 0);
  loadRuleBase(json.SUPRISED.length, json.SUPRISED, "SUPRISED", table, 0);

  var div = document.getElementById("rulebase-table");
  div.appendChild(table);
});

// this will show the info it in firebug console

function loadRuleBase(length, jsonEmotion, emotion, table, isTag) {
  // Draws rulebase table with values
  var keys = ["Image", "A1", "A2", "A3", "A4", "A5", "A6"];
  for (var r = 0; r < length; r++) {
    var tr = document.createElement("tr");
    for (var c = 0; c < 7; c++) {
      var td = document.createElement("td");

      var text =
        isTag == true
          ? document.createTextNode(keys[c])
          : document.createTextNode(jsonEmotion[r][keys[c]]);
      td.appendChild(text);
      tr.appendChild(td);
    }
    var td = document.createElement("td");
    var text = document.createTextNode(emotion);
    td.appendChild(text);
    tr.appendChild(td);
    table.appendChild(tr);
  }
}

readRuleBase(); // Invokes functions while the page is loading
