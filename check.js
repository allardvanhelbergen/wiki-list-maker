var scrapyard = require("scrapyard");
var async = require("async");
var url = require("url");

var URL = "http://en.wikipedia.org/wiki/List_of_computer_scientists";

var _total = 0;
var _women = 0;

var scraper = new scrapyard({
	debug: false,
	retries: 5,
	connections: 10,
	cache: './storage', 
	bestbefore: "5min"
});

var q = async.queue(function(fn,next){
	return fn(next);
}, 10);

q.drain = function(){
	console.log(_total, _women, (_women/_total));
};

scraper.scrape({
	url: URL,
	type: 'html',
	encoding: 'utf8',
	merhod: 'GET',
}, function(err, $){
	if (err) return console.log(err);
	
	$('li a[href^="/wiki"]:first-child', '#mw-content-text').each(function(idx, e){
		
		var check_url = url.resolve(URL, $(this).attr('href'));
				
		_total++;
				
		q.push(function(next){

			scraper.scrape({
				url: check_url,
				type: 'html',
				encoding: 'utf8',
				merhod: 'GET',
			}, function(err, $){

				if (/Category:Women/.test($('#catlinks').html())) {
					
					console.log("yay: "+check_url);
					_women++;
					
				}
				
				
				next();
			
			});
			
		});

	});
	
});
