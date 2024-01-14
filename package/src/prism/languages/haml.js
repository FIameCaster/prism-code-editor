import { languages } from '../core.js';
import './ruby.js';

var haml = languages.haml = {
	// Multiline stuff should appear before the rest

	'multiline-comment': {
		pattern: /((?:^|\r?\n|\r)([\t ]*))(?:\/|-#).*(?:(?:\r?\n|\r)\2[\t ].+)*/,
		lookbehind: true,
		alias: 'comment'
	},

	'multiline-code': [
		{
			pattern: /((?:^|\r?\n|\r)([\t ]*)(?:[~-]|[&!]?=)).*,[\t ]*(?:(?:\r?\n|\r)\2[\t ].*,[\t ]*)*(?:(?:\r?\n|\r)\2[\t ].+)/,
			lookbehind: true,
			inside: 'ruby'
		},
		{
			pattern: /((?:^|\r?\n|\r)([\t ]*)(?:[~-]|[&!]?=)).*\|[\t ]*(?:(?:\r?\n|\r)\2[\t ].*\|[\t ]*)*/,
			lookbehind: true,
			inside: 'ruby'
		}
	]
};

var filter_pattern = '((?:^|\\r?\\n|\\r)([\\t ]*)):{{name}}(?:(?:\\r?\\n|\\r)(?:\\2[\\t ].+|\\s*?(?=\\r?\\n|\\r)))+';

// Non exhaustive list of available filters and associated languages
[
	'css',
	'coffee',
	'erb',
	'javascript',
	'less',
	'markdown',
	'ruby',
	'scss',
	'textile'
].forEach(filter => {
	var language = filter == 'coffee' ? 'coffeescript' : filter;
	haml['filter-' + filter] = {
		pattern: RegExp(filter_pattern.replace('{{name}}', filter)),
		lookbehind: true,
		inside: {
			'filter-name': {
				pattern: /^:[\w-]+/,
				alias: 'symbol'
			},
			'text': {
				pattern: /[\s\S]+/,
				alias: 'language-' + language,
				inside: language
			}
		}
	};
})

Object.assign(haml, {
	'filter': {
		pattern: /((?:^|\r?\n|\r)([\t ]*)):[\w-]+(?:(?:\r?\n|\r)(?:\2[\t ].+|\s*?(?=\r?\n|\r)))+/,
		lookbehind: true,
		inside: {
			'filter-name': {
				pattern: /^:[\w-]+/,
				alias: 'symbol'
			}
		}
	},

	'markup': {
		pattern: /((?:^|\r?\n|\r)[\t ]*)<.+/,
		lookbehind: true,
		inside: 'markup'
	},
	'doctype': {
		pattern: /((?:^|\r?\n|\r)[\t ]*)!!!(?: .+)?/,
		lookbehind: true
	},
	'tag': {
		// Allows for one nested group of braces
		pattern: /((?:^|\r?\n|\r)[\t ]*)[%.#][\w\-#.]*[\w\-](?:\([^)]+\)|\{(?:\{[^}]+\}|[^{}])+\}|\[[^\]]+\])*[\/<>]*/,
		lookbehind: true,
		inside: {
			'attributes': [
				{
					// Lookbehind tries to prevent interpolations from breaking it all
					// Allows for one nested group of braces
					pattern: /(^|[^#])\{(?:\{[^}]+\}|[^{}])+\}/,
					lookbehind: true,
					inside: 'ruby'
				},
				{
					pattern: /\([^)]+\)/,
					inside: {
						'attr-value': {
							pattern: /(=\s*)(?:"(?:\\.|[^\\"\r\n])*"|[^)\s]+)/,
							lookbehind: true
						},
						'attr-name': /[\w:-]+(?=\s*!?=|\s*[,)])/,
						'punctuation': /[=(),]/
					}
				},
				{
					pattern: /\[[^\]]+\]/,
					inside: 'ruby'
				}
			],
			'punctuation': /[<>]/
		}
	},
	'code': {
		pattern: /((?:^|\r?\n|\r)[\t ]*(?:[~-]|[&!]?=)).+/,
		lookbehind: true,
		inside: 'ruby'
	},
	// Interpolations in plain text
	'interpolation': {
		pattern: /#\{[^}]+\}/,
		inside: {
			'delimiter': {
				pattern: /^#\{|\}$/,
				alias: 'punctuation'
			},
			'ruby': {
				pattern: /[\s\S]+/,
				inside: 'ruby'
			}
		}
	},
	'punctuation': {
		pattern: /((?:^|\r?\n|\r)[\t ]*)[~=\-&!]+/,
		lookbehind: true
	}
});
