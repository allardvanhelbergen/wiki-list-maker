'use strict';


var async = require('async');
var Scrapyard = require('scrapyard');
var url = require('url');
var fs = require ('fs');

var URL = 'http://en.wikipedia.org/wiki/List_of_computer_scientists';
var OUTPUT_DIR = './output';
var CACHE_DIR = './storage';
var total = 0;
var women = 0;
var data = [];

var scraper = new Scrapyard({
  debug: false,
  retries: 5,
  connections: 10,
  cache: CACHE_DIR,
  bestbefore: '5min'
});


var scrapeQueue = async.queue(function(fn, next) {
  return fn(next);
}, 10);


scrapeQueue.drain = function() {
  console.log('Total entries:', total);
  console.log('Total women entries:', women);
  console.log('Percentage women entries:', (women / total));
  fs.writeFileSync(OUTPUT_DIR + '/' + Date.now() + '.json', JSON.stringify(data, null, '\t'));
};


scraper.scrape({
  url: URL,
  type: 'html',
  encoding: 'utf8',
  method: 'GET',
}, function(err, $) {

  if (err) {
    return console.error(err);
  }

  $('li a[href^="/wiki"]:first-child', '#mw-content-text').each(function(idx, e) {
    var checkUrl = url.resolve(URL, $(this).attr('href'));
    var checkName = $(this).attr('title');

    total++;

    scrapeQueue.push(function(next) {
      scraper.scrape({
        url: checkUrl,
        type: 'html',
        encoding: 'utf8',
        method: 'GET',
      }, function(err, $) {

        if (/Category:Women/.test($('#catlinks').html())) {
          console.log(checkUrl);
          women++;
          data.push({name: checkName, url: checkUrl});
        }

        next();
      });
    });
  });
});
