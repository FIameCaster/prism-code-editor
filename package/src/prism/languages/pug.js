import { languages, rest } from '../core.js';
import { insertBefore } from '../utils/language.js';
import './markup.js';
import './javascript.js';

// TODO:
// - Add CSS highlighting inside <style> tags
// - Add support for multi-line code blocks
// - Add support for interpolation #{} and !{}
// - Add support for tag interpolation #[]
// - Add explicit support for plain text using |
// - Add support for markup embedded in plain text

var js = languages.js;
var filter_pattern = /(^([\t ]*)):<filter_name>(?:(?:\r?\n|\r(?!\n))(?:\2[\t ].+|\s*?(?=\r?\n|\r)))+/.source;

var langMap = {
	atpl: 'twig',
	coffee: 'coffeescript',
	sass: 'scss'
};

var pug = languages.pug = {

	// Multiline stuff should appear before the rest

	// This handles both single-line and multi-line comments
	'comment': {
		pattern: /(^([\t ]*))\/\/.*(?:(?:\r?\n|\r)\2[\t ].+)*/m,
		lookbehind: true
	},

	// All the tag-related part is in lookbehind
	// so that it can be highlighted by the "tag" pattern
	'multiline-script': {
		pattern: /(^([\t ]*)script\b.*\.[\t ]*)(?:(?:\r?\n|\r(?!\n))(?:\2[\t ].+|\s*?(?=\r?\n|\r)))+/m,
		lookbehind: true,
		inside: js
	}
};

// Non exhaustive list of available filters
[
	'atpl',
	'coffee',
	'ejs',
	'handlebars',
	'less',
	'livescript',
	'markdown',
	'sass',
	'stylus'
].forEach(filter => {
	var language = langMap[filter] || filter;
	pug['filter-' + filter] = {
		pattern: RegExp(filter_pattern.replace('<filter_name>', filter), 'm'),
		lookbehind: true,
		inside: {
			'filter-name': {
				pattern: /^:[\w-]+/,
				alias: 'variable'
			},
			'text': {
				pattern: /\S[\s\S]*/,
				alias: 'language-' + language,
				inside: language
			}
		}
	};
});

Object.assign(pug, {
	'filter': {
		pattern: /(^([\t ]*)):.+(?:(?:\r?\n|\r(?!\n))(?:\2[\t ].+|\s*?(?=\r?\n|\r)))+/m,
		lookbehind: true,
		inside: {
			'filter-name': {
				pattern: /^:[\w-]+/,
				alias: 'variable'
			},
			'text': /\S[\s\S]*/,
		}
	},

	'multiline-plain-text': {
		pattern: /(^([\t ]*)[\w\-#.]+\.[\t ]*)(?:(?:\r?\n|\r(?!\n))(?:\2[\t ].+|\s*?(?=\r?\n|\r)))+/m,
		lookbehind: true
	},
	'markup': {
		pattern: /(^[\t ]*)<.+/m,
		lookbehind: true,
		inside: languages.html
	},
	'doctype': {
		pattern: /((?:^|\n)[\t ]*)doctype(?: .+)?/,
		lookbehind: true
	},

	// This handle all conditional and loop keywords
	'flow-control': {
		pattern: /(^[\t ]*)(?:case|default|each|else|if|unless|when|while)\b(?: .+)?/m,
		lookbehind: true,
		inside: {
			'each': {
				pattern: /^each .+? in\b/,
				inside: {
					'keyword': /\b(?:each|in)\b/,
					'punctuation': /,/
				}
			},
			'branch': {
				pattern: /^(?:case|default|else|if|unless|when|while)\b/,
				alias: 'keyword'
			},
			[rest]: js
		}
	},
	'keyword': {
		pattern: /(^[\t ]*)(?:append|block|extends|include|prepend)\b.+/m,
		lookbehind: true
	},
	'mixin': [
		// Declaration
		{
			pattern: /(^[\t ]*)mixin .+/m,
			lookbehind: true,
			inside: {
				'keyword': /^mixin/,
				'function': /\w+(?=\s*\(|\s*$)/,
				'punctuation': /[(),.]/
			}
		},
		// Usage
		{
			pattern: /(^[\t ]*)\+.+/m,
			lookbehind: true,
			inside: {
				'name': {
					pattern: /^\+\w+/,
					alias: 'function'
				},
				[rest]: js
			}
		}
	],
	'script': {
		pattern: /(^[\t ]*script(?:(?:&[^(]+)?\([^)]+\))*[\t ]).+/m,
		lookbehind: true,
		inside: js
	},

	'plain-text': {
		pattern: /(^[\t ]*(?!-)[\w\-#.]*[\w\-](?:(?:&[^(]+)?\([^)]+\))*\/?[\t ]).+/m,
		lookbehind: true
	},
	'tag': {
		pattern: /(^[\t ]*)(?!-)[\w\-#.]*[\w\-](?:(?:&[^(]+)?\([^)]+\))*\/?:?/m,
		lookbehind: true,
		inside: {
			'attributes': [
				{
					pattern: /&[^(]+\([^)]+\)/,
					inside: js
				},
				{
					pattern: /\([^)]+\)/,
					inside: {
						'attr-value': {
							pattern: /(=\s*(?!\s))(?:\{[^}]*\}|[^,)\r\n]+)/,
							lookbehind: true,
							inside: js
						},
						'attr-name': /[\w-]+(?=\s*!?=|\s*[,)])/,
						'punctuation': /[!=(),]+/
					}
				}
			],
			'punctuation': /:/,
			'attr-id': /#[\w\-]+/,
			'attr-class': /\.[\w\-]+/
		}
	},
	'code': [
		{
			pattern: /(^[\t ]*(?:-|!?=)).+/m,
			lookbehind: true,
			inside: js
		}
	],
	'punctuation': /[.\-!=|]+/
})
