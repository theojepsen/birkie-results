var fs = require('fs');
var request = require('request');
var libxmljs = require("libxmljs");
var async = require('async');

var event_id = 102;
var num_bibs = 3737;
var per_page = 100;

var last_page = Math.ceil(num_bibs / per_page);

var pages = [];
for (var i = 1; i <= last_page; i++) pages.push(i);

var url_template = 'http://results.birkie.com/index.php?page_number=%1&event_id=%2';
var url_event = url_template.replace('%2', event_id);

var bibs = [];
async.eachLimit(pages, 4, function (page_num, cb) {
  var page_url = url_event.replace('%1', page_num);
  request(page_url, function (error, response, body) {
    if (error || response.statusCode != 200)
      return cb('Failed to fetch', page_url, 'because', error, '(HTTP' + response.statusCode  + ')');
    var doc = libxmljs.parseHtml(body);
    
    bibs.push.apply(bibs, doc.find('//div[3]/div/div/div/div[2]/div/table/tbody/tr/td[4]/a').map(function (n) {
      return parseInt(n.text().trim(), 10);
    }));
    cb();
  });
},
function done(err) {
  if (err)
    console.error(err);

  fs.writeFileSync('bibs_' + event_id + '.json', JSON.stringify(bibs));
});

