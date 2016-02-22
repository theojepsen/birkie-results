var fs = require('fs');
var url = require('url');
var http = require('http');
var request = require('request');
var libxmljs = require("libxmljs");
var async = require('async');
var path = require('path');

if (process.argv.length !== 5) {
  console.error('Usage:', process.argv[0], process.argv[1], 'EVENT_ID BIBS.JSON OUT_DIR');
  process.exit(1);
}

var event_id = process.argv[2];
var bibs_file = path.resolve(process.argv[3]);
var bibs = require(bibs_file);

var out_dir = path.resolve(process.argv[4]);
if (fs.existsSync(out_dir)) {
  if (!fs.statSync(out_dir).isDirectory()) {
    console.error('Output directory already exists and is not a directory:', out_dir);
    process.exit(1);
  }
}
else
  fs.mkdirSync(out_dir);


var url_template = 'http://results.birkie.com/participant.php?event_id=%1&bib=%2';
var url_event = url_template.replace('%1', event_id);

async.eachLimit(bibs, 4, function (bib, cb) {
  var racer_url = url_event.replace('%2', bib);
  console.log('Downloading', racer_url);

  var urlObj = url.parse(racer_url);

  var filename = urlObj.path.split('/')[1];
  var out_file = fs.createWriteStream(path.join(out_dir, filename));
  var request = http.get(racer_url, function (res) {
    res.pipe(out_file);
    res.on('end', cb);
  });
},
function done(err) {
  if (err)
    console.error(err);
});


