var libxmljs = require("libxmljs");
var path = require('path');
var fs = require('fs');
var async = require('async');

if (process.argv.length < 3) {
  console.error('Usage:', process.argv[0], process.argv[1], ' HTML_OUT_DIR  [OUT.JSON]');
  process.exit(1);
}

var raw_dir_path = process.argv[2];
var out_file = process.argv[3] || 'out.json';


var raw_files = fs.readdirSync(raw_dir_path).map(function (f) { return path.join(raw_dir_path, f); });

//raw_files = ['./raw/participant.php?event_id=115&bib=14215'];

var rePlace = /^(\d+).*out of (\d+)/;
var rePlaceAg = /^(\d+).*out of (\d+) .*in (.*)/;
var reClean = /[^\x00-\x7F]|\r|\n/g;
var reOriginUSA = /([^,]+)\s*,\s+(\w\w)\s+(USA|United States)$/i;
var reOriginCan = /([^,]+)\s*,\s+(\w\w)\s+(Can)$/i;

function nodeText(n) { return n.text().trim(); }

var racers = [];
async.each(raw_files, function (f, cb) {
  //console.log(f);
  var t = fs.readFileSync(f).toString();
  var doc = libxmljs.parseHtml(t);
  var racer = {};

  racer.name = doc.get('//div[3]/div/div/div[2]/table[1]/tbody/tr/td/div[2]/h3').text().trim();
  racer.event = doc.get('//div[3]/div/div/div[2]/table[2]/tbody/tr/td[1]/table/tbody/tr[2]/td[2]').text().trim();
  racer.wave = doc.get('//div[3]/div/div/div[2]/table[2]/tbody/tr/td[1]/table/tbody/tr[3]/td[2]').text().trim();
  racer.bib = parseInt(doc.get('//div[3]/div/div/div[2]/table[2]/tbody/tr/td[1]/table/tbody/tr[4]/td[2]').text(), 10);
  racer.age = parseInt(doc.get('//div[3]/div/div/div[2]/table[2]/tbody/tr/td[1]/table/tbody/tr[5]/td[2]').text(), 10);
  racer.gender = doc.get('//div[3]/div/div/div[2]/table[2]/tbody/tr/td[1]/table/tbody/tr[6]/td[2]').text().trim();

  var orig_str = doc.get('//div[3]/div/div/div[2]/table[1]/tbody/tr/td/div[2]/span').text().trim();
  var m;
  if ((m = orig_str.match(reOriginUSA)))
    racer.origin = m.slice(1, 3).concat(['USA']).join(', ');
  else if ((m = orig_str.match(reOriginCan)))
    racer.origin = m.slice(1, 3).concat(['Can']).join(', ');
  else
    racer.origin = orig_str;


  if (t.indexOf('No finish results found for this participant.') !== -1) {
    racer.dnf = true;
    return racers.push(racer);
  }

  var overall_place_str = doc.get('//div[3]/div/div/div[2]/table[2]/tbody/tr/td[2]/div/table/tbody/tr[3]/td[2]').text().trim();
  var gender_place_str = doc.get('//div[3]/div/div/div[2]/table[2]/tbody/tr/td[2]/div/table/tbody/tr[4]/td[2]').text().trim();
  var ag_place_str = doc.get('//div[3]/div/div/div[2]/table[2]/tbody/tr/td[2]/div/table/tbody/tr[5]/td[2]').text().trim();

  m = overall_place_str.match(rePlace);
  racer.overall_place = parseInt(m[1], 10);
  racer.overall_place_of = parseInt(m[2], 10);

  m = gender_place_str.match(rePlace);
  racer.gender_place = parseInt(m[1], 10);
  racer.gender_place_of = parseInt(m[2], 10);

  m = ag_place_str.replace(reClean, '').match(rePlaceAg);
  if (m) {
    racer.ag_place = parseInt(m[1], 10);
    racer.ag_place_of = parseInt(m[2], 10);
    racer.ag = m[3].trim();
  }

  var locs = doc.find('//div[3]/div/div/div[2]/table[3]/tbody/tr/td[1]').map(nodeText);
  var overall_places = doc.find('//div[3]/div/div/div[2]/table[3]/tbody/tr/td[3]').map(nodeText);
  var gender_places = doc.find('//div[3]/div/div/div[2]/table[3]/tbody/tr/td[4]').map(nodeText);
  var ag_places = doc.find('//div[3]/div/div/div[2]/table[3]/tbody/tr/td[5]').map(nodeText);
  var times = doc.find('//div[3]/div/div/div[2]/table[3]/tbody/tr/td[6]').map(nodeText);

  racer.locations = {};
  for (var i = 0; i < locs.length; i++)
    racer.locations[locs[i]] = {
      race_time: times[i],
      overall_place: parseInt(overall_places[i], 10),
      gender_place: parseInt(gender_places[i], 10),
      ag_place: parseInt(ag_places[i], 10)
    };

  racers.push(racer);
  cb();
},
function done(err) {
  if (err)
    console.error(err);
  fs.writeFileSync(out_file, JSON.stringify(racers));
});
