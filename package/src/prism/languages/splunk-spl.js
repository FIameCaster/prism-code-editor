import { languages } from '../core.js';

languages['splunk-spl'] = {
	'comment': /`comment\("(?:\\.|[^\\"])*"\)`/,
	'string': {
		pattern: /"(?:\\.|[^\\"])*"/g,
		greedy: true
	},
	// https://docs.splunk.com/Documentation/Splunk/7.3.0/SearchReference/ListOfSearchCommands
	'keyword': /\b(?:abstract|accum|addcoltotals|addinfo|addtotals|analyzefields|anomalies|anomalousvalue|anomalydetection|append|appendcols|appendcsv|appendlookup|appendpipe|arules|associate|audit|autoregress|bin|bucket|bucketdir|chart|cluster|cofilter|collect|concurrency|contingency|convert|correlate|datamodel|dbinspect|dedup|delete|delta|diff|erex|eval|eventcount|eventstats|extract|fieldformat|fields|fieldsummary|filldown|fillnull|findtypes|folderize|foreach|format|from|gauge|gentimes|geom|geomfilter|geostats|head|highlight|history|iconify|input|inputcsv|inputlookup|iplocation|join|kmeans|kv|kvform|loadjob|localize|localop|lookup|makecontinuous|makemv|makeresults|map|mcollect|metadata|metasearch|meventcollect|mstats|multikv|multisearch|mvcombine|mvexpand|nomv|outlier|outputcsv|outputlookup|outputtext|overlap|pivot|predict|rangemap|rare|regex|relevancy|reltime|rename|replace|rest|return|reverse|rex|rtorder|run|savedsearch|script|scrub|search|searchtxn|selfjoin|sendemail|set|setfields|sichart|sirare|sistats|sitimechart|sitop|sort|[sx]path|strcat|streamstats|table|tags|tail|timechart|timewrap|top|transaction|transpose|trendline|tscollect|t?stats|typeahead|typelearner|typer|union|uniq|untable|where|x11|xmlkv|xmlunescape|xyseries)\b/i,
	'operator-word': {
		pattern: /\b(?:and|as|by|not|x?or)\b/i,
		alias: 'operator'
	},
	'function': /\b\w+(?=\s*\()/,
	'property': /\b\w+(?=\s*=(?!=))/,
	'date': {
		// MM/DD/YYYY(:HH:MM:SS)?
		pattern: /\b\d\d?\/\d\d?\/\d{1,4}(?:(?::\d\d?){3})?\b/,
		alias: 'number'
	},
	'number': /\b\d+(?:\.\d+)?\b/,
	'boolean': /\b(?:false|true|f|t)\b/i,
	'operator': /[<>=]=?|[%|/*+-]/,
	'punctuation': /[()[\],]/
};
