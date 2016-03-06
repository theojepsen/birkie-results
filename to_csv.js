var fs = require('fs');
var path = require('path');
var json2csv = require('json2csv');

function uniq(l) {
  return l.filter(function (n, i) { return l.indexOf(n) === i; });
}

function normalizeLocName(name) {
  if (name === 'Start to Double O')
    name = 'Double O';
  if (name === 'Double O to Finish')
    name = 'Finish';
  if (name === 'Highway OO')
    name = 'Double O';
  return name.toLowerCase().replace(/ /g, '_');
}

function getWaveNum(r, year) {
  if (r.wave) {
    var m;
    if ((m = r.wave.match(/ ([0-9]+)/)))
      return parseInt(m[1], 10);
    if ((m = r.wave.match(/elite/i)))
      return 0;
    if ((m = r.wave.match(/spirit of/i)))
      return 35;
  }
  if (r.bib < 1000)
    return 0;
  if (r.bib < 2000 || (r.bib > 10000 && (r.bib - 10000 < 2000)))
    return 1;
  if (r.bib < 3000 || (r.bib > 10000 && (r.bib - 10000 < 3000)))
    return 2;
  if (r.bib < 4000 || (r.bib > 10000 && (r.bib - 10000 < 4000)))
    return 3;
  if (r.bib < 5000 || (r.bib > 10000 && (r.bib - 10000 < 5000)))
    return 4;
  if (r.bib < 6000 || (r.bib > 10000 && (r.bib - 10000 < 6000)))
    return 5;
  if (r.bib < 7000 || (r.bib > 10000 && (r.bib - 10000 < 7000)))
    return 6;
  if (r.bib < 8000 || (r.bib > 10000 && (r.bib - 10000 < 8000)))
    return 7;
  if (r.bib < 9000 || (r.bib > 10000 && (r.bib - 10000 < 9000)))
    return 8;
  if (r.bib < 10000 || (r.bib > 10000 && (r.bib - 10000 < 10000)))
    return 9;
  if (35000 <= r.bib && r.bib < 36000)
    return 35;
  if (70000 <= r.bib && r.bib < 80000)
    return 70;
  if (90000 <= r.bib && r.bib < 100000)
    return 90;
}

var fields = [];
var years = [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016];
var results = [];
years.forEach(function (y) {
  var results_for_year = require(path.resolve('out/results_' + y + '.json'));

  results_for_year = results_for_year.map(function (r) {

    r.year = y;

    // Turn the locations map into distinct fields
    if (r.locations) {
      Object.keys(r.locations).forEach(function (loc) {
        // Normalize the location names of the splits
        var newName = normalizeLocName(loc);
        if (newName === 'start') return;
        r[newName + '_race_time'] = r.locations[loc].race_time;
        r[newName + '_overall_place'] = r.locations[loc].overall_place;
        r[newName + '_gender_place'] = r.locations[loc].gender_place;
        r[newName + '_ag_place'] = r.locations[loc].ag_place;
      });
      delete r.locations;
    }

    // Get a consistent wave number across years
    r.wave_num = getWaveNum(r, y);

    // Find all the possible column names
    Object.keys(r).forEach(function (k) { if (fields.indexOf(k) === -1) fields.push(k); });

    return r;
  });


  Array.prototype.push.apply(results, results_for_year);
});


json2csv({ data: results, fields: fields }, function(err, csv) {
  if (err) console.log(err);
  fs.writeFileSync('all_results.csv', csv);
});
