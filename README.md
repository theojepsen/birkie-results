# birkie-results

## Overview
  * `scrape_bibs.js` - scrape bib numbers for an event
  * `scrape_racers.js` - scrape participant info/stats HTML pages
  * `parse*js` - parse a bunch of HTML participant pages

## Examples

### Scrape and parse 2013 results
First, scrape the bib numbers for both the classic and skate events:
```bash
$ mkdir 2013
$ cd 2013
$ node ../scrape_bibs.js 91 1798 bibs_91.json
$ node ../scrape_bibs.js 90 3954 bibs_90.json
```

Scrape the HTML page for all the racers:
```bash
$ node ../scrape_racers.js 90 bibs_90.json ./html
$ node ../scrape_racers.js 91 bibs_91.json ./html
```

Parse the HTML racer pages, and generate a results JSON file:
```bash
$ node ../parse_older.js ./html results_2013.json
```

Print results for racer with bib #2:
```bash
$ node ../print_racer.js results_2013.json 2
```
