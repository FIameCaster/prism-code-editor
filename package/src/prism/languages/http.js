import { languages } from '../core.js';

/**
 * @param {RegExp} name
 * @returns {RegExp}
 */
var headerValueOf = name => RegExp('(^(?:' + name.source + '):[ \t]*(?![ \t]))[^]+', 'i');

var http = languages.http = {
	'request-line': {
		pattern: /^(?:CONNECT|DELETE|GET|HEAD|OPTIONS|PATCH|POST|PRI|PUT|SEARCH|TRACE)\s(?:https?:\/\/|\/)\S*\sHTTP\/[\d.]+/m,
		inside: {
			// HTTP Method
			'method': {
				pattern: /^[A-Z]+\b/,
				alias: 'property'
			},
			// Request Target e.g. http://example.com, /path/to/file
			'request-target': {
				pattern: /^(\s)(?:https?:\/\/|\/)\S*(?=\s)/,
				lookbehind: true,
				alias: 'url',
				inside: 'uri'
			},
			// HTTP Version
			'http-version': {
				pattern: /^(\s)HTTP\/[\d.]+/,
				lookbehind: true,
				alias: 'property'
			},
		}
	},
	'response-status': {
		pattern: /^HTTP\/[\d.]+ \d+ .+/m,
		inside: {
			// HTTP Version
			'http-version': {
				pattern: /^HTTP\/[\d.]+/,
				alias: 'property'
			},
			// Status Code
			'status-code': {
				pattern: /^(\s)\d+(?=\s)/,
				lookbehind: true,
				alias: 'number'
			},
			// Reason Phrase
			'reason-phrase': {
				pattern: /^(\s).+/,
				lookbehind: true,
				alias: 'string'
			}
		}
	}
};

// Create a mapping of Content-Type headers to language definitions

var httpLanguages = [
	'application/javascript',
	'application/json',
	'application/xml',
	'text/xml',
	'text/html',
	'text/css',
	'text/plain'
];

/**
 * Returns a pattern for the given content type which matches it and any type which has it as a suffix.
 *
 * @param {string} contentType
 * @returns {string}
 */
var getSuffixPattern = (contentType, lang) => '(?:' + contentType + '|\\w+/(?:[\\w.-]+\\+)+' + lang + '(?![+\\w.-]))';

httpLanguages.forEach(contentType => {
	var lang = contentType.split('/')[1];
	var pattern = contentType[0] == 'a' && !contentType[17] ? getSuffixPattern(contentType, lang) : contentType;

	http[contentType.replace('/', '-')] = {
		pattern: RegExp('(content-type:\\s*'+ pattern + '(?:\n[\\w-].*)*\n)[^ \t\\w-][^]*', 'i'),
		lookbehind: true,
		inside: lang == 'json' ? languages.json || 'js' : lang
	};
});

http.header = {
	pattern: /^[\w-]+:.+(?:\n[ \t].+)*/m,
	inside: {
		'header-value': [
			{
				pattern: headerValueOf(/Content-Security-Policy/),
				lookbehind: true,
				alias: 'languages-csp',
				inside: 'csp'
			},
			{
				pattern: headerValueOf(/Public-Key-Pins(?:-Report-Only)?/),
				lookbehind: true,
				alias: 'languages-hpkp',
				inside: 'hpkp'
			},
			{
				pattern: headerValueOf(/Strict-Transport-Security/),
				lookbehind: true,
				alias: 'languages-hsts',
				inside: 'hsts'
			},
			{
				pattern: headerValueOf(/[^:]+/),
				lookbehind: true
			}
		],
		'header-name': {
			pattern: /^[^:]+/,
			alias: 'keyword'
		},
		'punctuation': /^:/
	}
};
