var fs = require('fs');
var util = require('util');
var acr_to_state = require('./states_hash.json');

var racers = JSON.parse(fs.readFileSync(process.argv[2]).toString());

var places = {};

racers.forEach(function (r) {
  if (r.dnf) return;
  var loc;
  var abc = r.origin.split(',').map(function (r) { return r.trim(); });
  if (acr_to_state[abc[1]])
    loc = abc[1];
  else
    loc = abc[2];

  if (!places[loc])
    places[loc] = [];
  places[loc].push(r.overall_place);
});

var averages = {};

Object.keys(places).forEach(function (p) {
  averages[p] = places[p].reduce(function(pv, cv) { return pv + cv; }, 0) / places[p].length;
});

//console.log(averages);

//console.log('Rank Country/State #_of_Skiers Average_Skier_Overall_Ranking');
var table = [];
var i = 0;
Object.keys(places).sort(function (a, b) { return averages[a] - averages[b]; }).forEach(function (p) {
  table.push([++i, p, places[p].length, averages[p]]);
  //console.log(++i + '. ' + p + ' ' + places[p].length + ' '  + averages[p]);
});

console.log(table);
