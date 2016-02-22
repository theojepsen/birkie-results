var libxmljs = require("libxmljs");
var path = require('path');

var fs = require('fs');

var raw_dir_path = process.argv[2];
var raw_files = fs.readdirSync(raw_dir_path).map(function (f) { return path.join(raw_dir_path, f); });

//raw_files = ['./raw/index.php?page=1150&r_page=participantdetails&BibNo=1'];

var rePlace = /^(\d+).*out of (\d+)/;
var rePlaceAg = /^(\d+).*out of (\d+) .*in (.*)/;
var reClean = /[^\x00-\x7F]|\r|\n/g;

var racers = [];
raw_files.forEach(function (f) {
  //console.log(f);
  var t = fs.readFileSync(f).toString();
  var doc = libxmljs.parseHtml(t);
  var racer = {};

  racer.name = doc.get('//div/table/tr/td[1]/div[2]/h4').text();
  racer.event = doc.get('//div/div/table[1]/tr/td[1]/table/tr[2]/td[2]').text();
  racer.bib = parseInt(doc.get('//div/div/table[1]/tr/td[1]/table/tr[3]/td[2]').text(), 10);
  racer.age = parseInt(doc.get('//div/div/table[1]/tr/td[1]/table/tr[4]/td[2]').text(), 10);
  racer.gender = doc.get('//div/div/table[1]/tr/td[1]/table/tr[5]/td[2]').text();
  racer.origin = doc.get('//div/div/table[1]/tr/td[1]/table/tr[6]/td[2]').text();

  if (t.indexOf('No finish results found for this participant.') !== -1) {
    racer.dnf = true;
    return racers.push(racer);
  }

  var overall_place_str = doc.get('//div/div/table[1]/tr/td[2]/div/table/tr[3]/td[2]').text().trim();
  var gender_place_str = doc.get('//div/div/table[1]/tr/td[2]/div/table/tr[4]/td[2]').text().trim();
  var ag_place_str = doc.get('//div/div/table[1]/tr/td[2]/div/table/tr[5]/td[2]').text().trim();

  var m = overall_place_str.match(rePlace);
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

  var locs = {};
  doc.get('//div/div/table[2]').childNodes().forEach(function (c) {
    if (!c.get('td[1]')) return;
    locs[c.get('td[1]').text()] = {
      race_time: c.get('td[3]').text().trim(),
      day_time: c.get('td[4]').text().trim(),
      overall_place: parseInt(c.get('td[5]').text().trim(), 10),
      gender_place: parseInt(c.get('td[6]').text().trim(), 10),
      ag_place: parseInt(c.get('td[7]').text().trim(), 10)
    };
  });
  racer.locations = locs;
  racers.push(racer);

  //console.log(racer);
});

fs.writeFileSync('out.json', JSON.stringify(racers));
