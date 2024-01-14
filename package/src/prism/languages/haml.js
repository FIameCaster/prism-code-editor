import { languages } from '../core.js';
import './ruby.js';

var haml = languages.haml = {
	// Multiline stuff should appear before the rest

	'multiline-comment': {
		pattern: /(^[\t ]*)(?:\/|-#).*(?:\n\1[\t ].+)*/m,
		lookbehind: true,
		alias: 'comment'
	},

	'multiline-code': [
		{
			pattern: /(^([\t ]*)(?:[~-]|[&!]?=)).*,[\t ]*(?:\n\2[\t ].*,[\t ]*)*(?:\n\2[\t ].+)/m,
			lookbehind: true,
			inside: 'ruby'
		},
		{
			pattern: /(^([\t ]*)(?:[~-]|[&!]?=)).*\|[\t ]*(?:\n\2[\t ].*\|[\t ]*)*/m,
			lookbehind: true,
			inside: 'ruby'
		}
	]
};

var filter_pattern = '(^[\\t ]*):{{name}}(?:\\n(?:\\1[\\t ].+|\\s*?$))+';

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
		pattern: RegExp(filter_pattern.replace('{{name}}', filter), 'm'),
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
		pattern: /(^[\t ]*):[\w-]+(?:\n(?:\1[\t ].+|\s*?$))+/m,
		lookbehind: true,
		inside: {
			'filter-name': {
				pattern: /^:[\w-]+/,
				alias: 'symbol'
			}
		}
	},

	'markup': {
		pattern: /(^[\t ]*)<.+/m,
		lookbehind: true,
		inside: 'markup'
	},
	'doctype': {
		pattern: /(^[\t ]*)!!!(?: .+)?/m,
		lookbehind: true
	},
	'tag': {
		// Allows for one nested group of braces
		pattern: /(^[\t ]*)[%.#][\w\-#.]*[\w\-](?:\([^)]+\)|\{(?:\{[^}]+\}|[^{}])+\}|\[[^\]]+\])*[\/<>]*/m,
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
							pattern: /(=\s*)(?:"(?:\\.|[^\\"\n])*"|[^)\s]+)/,
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
		pattern: /(^[\t ]*(?:[~-]|[&!]?=)).+/m,
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
		pattern: /(^[\t ]*)[~=\-&!]+/m,
		lookbehind: true
	}
});
