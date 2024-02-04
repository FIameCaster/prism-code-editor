import { languages, rest } from '../core.js';
import './scheme.js';

var schemeExpression = /\((?:[^();"#\\]|\\[\s\S]|;.*(?!.)|"(?:[^"\\]|\\.)*"|#(?:\{(?:(?!#\})[\s\S])*#\}|[^{])|<expr>)*\)/.source;
// allow for up to pow(2, recursivenessLog2) many levels of recursive brace expressions
// For some reason, this can't be 4
for (var i = 0; i < 5; i++) {
	schemeExpression = schemeExpression.replace(/<expr>/g, schemeExpression);
}
schemeExpression = schemeExpression.replace(/<expr>/g, '[]');

var inside = {
	pattern: /[\s\S]+/,
	alias: 'language-lilypond'
};

inside.inside = languages.ly = languages.lilypond = {
	'comment': /%(?:(?!\{).*|\{[\s\S]*?%\})/,
	'embedded-scheme': {
		pattern: RegExp(/(^|[=\s])#(?:"(?:[^"\\]|\\.)*"|[^\s()"]*(?:[^\s()]|<expr>))/.source.replace(/<expr>/g, schemeExpression), 'mg'),
		lookbehind: true,
		greedy: true,
		inside: {
			'scheme': {
				pattern: /(?!^)[\s\S]+/,
				alias: 'language-scheme',
				inside: {
					'embedded-lilypond': {
						pattern: /#\{[\s\S]*?#\}/g,
						greedy: true,
						inside: {
							'punctuation': /^#\{|#\}$/,
							'lilypond': inside
						}
					},
					[rest]: languages.scheme
				}
			},
			'punctuation': /#/
		}
	},
	'string': {
		pattern: /"(?:[^"\\]|\\.)*"/g,
		greedy: true
	},
	'class-name': {
		pattern: /(\\new\s+)[\w-]+/,
		lookbehind: true
	},
	'keyword': {
		pattern: /\\[a-z][-\w]*/i,
		inside: {
			'punctuation': /^\\/
		}
	},
	'operator': /[=|]|<<|>>/,
	'punctuation': {
		pattern: /(^|[a-z\d])(?:'+|,+|[_^]?-[_^]?(?:[-+^!>._]|(?=\d))|[_^]\.?|[.!])|[{}()[\]<>^~]|\\[()[\]<>\\!]|--|__/,
		lookbehind: true
	},
	'number': /\b\d+(?:\/\d+)?\b/
};
