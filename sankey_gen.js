var fs = require('fs');
var util = require('util');
var path = require('path');


var nameRe = /([^\s]+) (.* )?(\w+)/i;
function parseName(n) {
  var m = n.match(nameRe);
  if (!m) {
    console.error("Could not match name: '" + n + "'");
    return;
  }
  return [m[1], m[2] ? m[2].trim() : null, m[3]];
}
function formatName(n) {
  return n[0] + ' ' + n[2];
}

function cmpName(nameObjA, nameObjB) {
  if (!nameObjA[1] || !nameObjB[1])
    return nameObjA[0] === nameObjB[0] && nameObjA[2] === nameObjB[2];
  else
    return nameObjA[0] === nameObjB[0] && nameObjA[1] === nameObjB[1] && nameObjA[2] === nameObjB[2];
}

function resultByName(results, n) {
  for (var i = 0; i < results.length; i++)
    if (cmpName(results[i].nameObj, n))
      return results[i];
  return null;
}

function indexOfName(l, nameObj) {
  for (var i = 0; i < l.length; i++)
    if (cmpName(l[i], nameObj)) return i;
  return -1;
}

function uniqNames(l) {
  return l.filter(function (n, i) { return indexOfName(l, n) === i; });
}
function findDup(l) {
  return uniqNames(l.filter(function (n, i) { return indexOfName(l, n) !== i; }));
}

function getWave(r, year) {
  if (r.wave) {
    var m;
    if ((m = r.wave.match(/ ([0-9]+) /)))
      return parseInt(m[1], 10);
    if ((m = r.wave.match(/elite/i)))
      return 0;
  }
  if (r.bib < 1000)
    return 0;
  if (r.bib < 2000)
    return 1;
  if (r.bib < 3000)
    return 2;
  if (r.bib < 4000)
    return 3;
  if (r.bib < 5000)
    return 4;
  if (r.bib < 6000)
    return 5;
  if (r.bib < 7000)
    return 6;
  if (r.bib < 8000)
    return 7;
  if (r.bib < 9000)
    return 8;
  if (r.bib < 10000)
    return 9;
  if (r.bib < 11000)
    return 10;
  if (r.bib < 12000)
    return 11;
  if (r.bib < 80000)
    return 70;
}

var years = [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016];
years = [2011, 2012, 2013, 2014, 2015, 2016];
var results = {};
years.forEach(function (y) {
  results[y] = require(path.resolve('out/results_' + y + '.json'));
  results[y].map(function (r) {
    r.waveNum = getWave(r, y);
    r.nameObj = parseName(r.name);
    return r;
  });
});

var names_for_year = years.map(function (y) { return results[y].map(function (r) { return r.nameObj; }); });
var all_names = uniqNames(names_for_year.reduce(function (p, c) {
  p.push.apply(p, c);
  return p;
}, []));

var node_names = [];
var nodes = [];
var from_to = {};
var links = [];
all_names.forEach(function (n) {
  var i, r;
  var waves = [];
  years.forEach(function (y) {
    if ((r = resultByName(results[y], n)))
      waves.push(y + '.' + r.waveNum);
  });
  if (waves.length < 2) return;
  //if (waves.length > 0) {
  //console.log(formatName(n));
  //console.log(waves);
  //}
  for (i = 0; i < waves.length - 1; i++) {
    if (node_names.indexOf(waves[i]) === -1) {
      node_names.push(waves[i]);
      nodes.push({name: waves[i], id: 'wave_' + waves[i]});
    }
    if (node_names.indexOf(waves[i+1]) === -1) {
      node_names.push(waves[i+1]);
      nodes.push({name: waves[i+1], id: 'wave_' + waves[i+1]});
    }
    var source = node_names.indexOf(waves[i]);
    var target = node_names.indexOf(waves[i+1]);
    if (!from_to[source]) from_to[source] = {};
    if (!from_to[source][target]) from_to[source][target] = 0;
    from_to[source][target]++;
  }
});
Object.keys(from_to).forEach(function (source) {
  Object.keys(from_to[source]).forEach(function (target) {
    links.push({
      source: parseInt(source, 10),
      target: parseInt(target, 10),
      value: from_to[source][target]
    });
  });
});



console.log(nodes);
console.log(links);
var data = {nodes: nodes, links: links};
var out_file = process.argv[2] || 'sankey_data.json';
fs.writeFileSync(out_file, JSON.stringify(data));
//console.log(JSON.stringify(data));

