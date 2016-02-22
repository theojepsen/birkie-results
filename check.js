var fs = require('fs');
var util = require('util');


var racers = JSON.parse(fs.readFileSync(process.argv[2]).toString());
var bibs = [];
//console.log('num skiers:', racers.length);

//console.log(util.inspect(racers.slice(0, 1), {showHidden: false, depth: null}));

racers.forEach(function (r) {
  //if (r.dnf) console.log('dnf');
  if (isNaN(r.bib)) {
    console.log(r.bib);
    console.log('bib nan');
  }
  if (r.origin.split(',').length !== 3) {
    console.log(r.bib);
    console.log('where is from?', r.origin);
  }
  if (isNaN(r.age)) {
    console.log(r.bib);
    console.log('bib nan');
  }

  if (bibs.indexOf(r.bib) !== -1) {
    console.log(r.bib);
    console.log('dup bib');
  }
  bibs.push(r.bib);

  if (r.dnf) return;

  if (r.event.indexOf('Birkebeiner') === -1) {
    console.log(r.bib);
    console.log('wrong event:', r.event);
  }
  if (r.event.indexOf('Haakon') !== -1) {
    console.log(r.bib);
    console.log('wrong event:', r.event);
  }
  if (r.event.indexOf('Korte') !== -1) {
    console.log(r.bib);
    console.log('wrong event:', r.event);
  }

  //if (!r.ag || r.ag.length < 2) {
  //  console.log(r.bib);
  //  console.log('r.ag.length < 2');
  //}

  ['overall_place', 'overall_place_of', 'gender_place', 'gender_place_of'].forEach(function (k) {
    if (isNaN(r[k])) {
      console.log(r.bib);
      console.log(k);
    }
  });
  if (r.ag) {
  ['ag_place', 'ag_place_of'].forEach(function (k) {
    if (isNaN(r[k])) {
      console.log(r.bib);
      console.log(k);
    }
  });
  }

  //if (Object.keys(r.locations).length < 5) {
  //    console.log(r.bib);
  //    console.log('too few locations');
  //}
});
