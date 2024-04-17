import { languages } from '../core.js';

/**
 * @param {string} name
 * @param {string} lang
 */
var headerValueOf = (name, lang) => ({
	pattern: RegExp('(^(?:' + name + '):[ \t]*)\\S[^]*', 'i'),
	lookbehind: true,
	alias: lang && 'language-' + lang,
	inside: lang
});

var http = languages.http = {
	'request-line': {
		pattern: /^(?:CONNECT|DELETE|GET|HEAD|OPTIONS|PATCH|POST|PRI|PUT|SEARCH|TRACE)\s(?:https?:\/)?\/\S*\sHTTP\/[\d.]+/m,
		inside: {
			// HTTP Method
			'method': {
				pattern: /^\w+/,
				alias: 'property'
			},
			// Request Target e.g. http://example.com, /path/to/file
			'request-target': {
				pattern: /^(\s)[h/]\S*/,
				lookbehind: true,
				alias: 'url',
				inside: 'uri'
			},
			// HTTP Version
			'http-version': {
				pattern: /(?!^)\S+/,
				alias: 'property'
			},
		}
	},
	'response-status': {
		pattern: /^HTTP\/[\d.]+ \d+ .+/m,
		inside: {
			// HTTP Version
			'http-version': {
				pattern: /^\S+/,
				alias: 'property'
			},
			// Status Code
			'status-code': {
				pattern: /^( )\d+(?= )/,
				lookbehind: true,
				alias: 'number'
			},
			// Reason Phrase
			'reason-phrase': {
				pattern: /(?!^).+/,
				alias: 'string'
			}
		}
	}
};

// Create a mapping of Content-Type headers to language definitions

[
	'application/javascript',
	'application/json',
	'application/xml',
	'text/xml',
	'text/html',
	'text/css',
	'text/plain'
].forEach(contentType => {
	var lang = contentType.split('/')[1];
	var pattern = contentType[10] && !lang[4]
		? '(?:' + contentType + '|\\w+/(?:[\\w.-]+\\+)+' + lang + '(?![\\w.+-]))' : contentType;

	http[contentType.replace('/', '-')] = {
		pattern: RegExp('(content-type:\\s*'+ pattern + '(?:;.*)?(?:\n[\\w-].*)*\n)[^ \t\\w-][^]*', 'i'),
		lookbehind: true,
		alias: 'language-' + lang,
		inside: lang == 'json' ? languages.json || 'js' : lang
	};
});

http.header = {
	pattern: /^[\w-]+:.+(?:\n[ \t].+)*/m,
	inside: {
		'header-value': [
			headerValueOf(/Content-Security-Policy/.source, 'csp'),
			headerValueOf(/Public-Key-Pins(?:-Report-Only)?/.source, 'hpkp'),
			headerValueOf(/Strict-Transport-Security/.source, 'hsts'),
			headerValueOf(/[^:]+/.source)
		],
		'header-name': {
			pattern: /^[^:]+/,
			alias: 'keyword'
		},
		'punctuation': /^:/
	}
};
