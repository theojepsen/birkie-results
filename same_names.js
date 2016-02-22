var fs = require('fs');
var util = require('util');
var path = require('path');

if (process.argv.length < 4) {
  console.error('Usage:', process.argv[0], process.argv[1], ' RESULTS.JSON  RESULTS.JSON');
  process.exit(1);
}

var nameRe = /([^\s]+) (.* )?(\w+)/i;
function parseName(n) {
  var m = n.match(nameRe);
  if (!m) {
    console.error("Could not match name: '" + n + "'");
    return;
  }
  return [m[1], m[2] ? m[2].trim() : null, m[3]];
}

function cmpName(nameObjA, nameObjB) {
  if (!nameObjA[1] || !nameObjB[1])
    return nameObjA[0] === nameObjB[0] && nameObjA[2] === nameObjB[2];
  else
    return nameObjA[0] === nameObjB[0] && nameObjA[1] === nameObjB[1] && nameObjA[2] === nameObjB[2];
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
var filenames = process.argv.slice(2);
var results_files = filenames.map(function (f) { return path.resolve(f); });

var years = results_files.map(require);

var names_for_year = years.map(function (y) { return y.map(function (r) { return parseName(r.name); }); });

console.log('Duplicate names for each year:');
names_for_year.forEach(function (y, i) {
  //console.log(findDup(y));
  console.log('\t', filenames[i] + ': ' + findDup(y).length);
});

var all_names = uniqNames(names_for_year.reduce(function (p, c) {
  p.push.apply(p, c);
  return p;
}, []));

var same_names = all_names.filter(function (n) {
  return names_for_year.every(function (year) {
    return indexOfName(year, n) !== -1;
  });
});

console.log('Number of racers in all races:', same_names.length);
