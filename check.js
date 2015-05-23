'use strict';


var async = require('async');
var fs = require ('fs');
var minimist = require('minimist');
var Scrapyard = require('scrapyard');
var url = require('url');


var DEFAULT_URL = 'http://en.wikipedia.org/wiki/List_of_computer_scientists';
var OUTPUT_DIR = './output';
var CACHE_DIR = './storage';
var total = 0;
var women = 0;
var data = [];


var processArguments = function(argv) {
  var settings = {};

  argv = minimist(argv);
  settings = {

    isVerbose: argv.v || false,
    rootUrl: argv.u || DEFAULT_URL
  };

  return settings;
};


var getScraperSettings = function(url) {
  return {
    url: url,
    type: 'html',
    encoding: 'utf8',
    method: 'GET',
  };
};


var scrapeQueue = async.queue(function(fn, next) {
  return fn(next);
}, 10);


scrapeQueue.drain = function() {
  console.info('Total entries:', total);
  console.info('Total women entries:', women);
  console.info('Percentage women entries:', (women / total));
  fs.writeFileSync(OUTPUT_DIR + '/' + Date.now() + '.json', JSON.stringify(data, null, '\t'));
};


var check = function() {
  var settings = processArguments(process.argv.slice(2));

  console.info('Checking:', settings.rootUrl);

  var scraper = new Scrapyard({
    debug: false,
    retries: 5,
    connections: 10,
    cache: CACHE_DIR,
    bestbefore: '5min'
  });

  scraper.scrape(getScraperSettings(settings.rootUrl), function(err, $) {

    if (err) {
      return console.error(err);
    }

    $('li a[href^="/wiki"]:first-child', '#mw-content-text').each(function(idx, e) {
      var checkUrl = url.resolve(settings.rootUrl, $(this).attr('href'));
      var checkName = $(this).attr('title');

      total++;

      scrapeQueue.push(function(next) {
        scraper.scrape(getScraperSettings(checkUrl), function(err, $) {

          if (/Category:Women/.test($('#catlinks').html())) {
            if (settings.isVerbose) {
              console.info('Found:', checkUrl);
            }

            women++;
            data.push({name: checkName, url: checkUrl});
          }

          next();
        });
      });
    });
  });
};


// Run the Scraper.
check();
