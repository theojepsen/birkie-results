var fs = require('fs');
var util = require('util');
var path = require('path');

if (process.argv.length < 4) {
  console.error('Usage:', process.argv[0], process.argv[1], ' RESULTS.JSON  BIB_NUM');
  process.exit(1);
}

var results_file = path.resolve(process.argv[2]);
var bib = parseInt(process.argv[3], 10);

var results = require(results_file);

results.forEach(function (r) {
  if (r.bib !== bib) return;
  console.log(r);
});
