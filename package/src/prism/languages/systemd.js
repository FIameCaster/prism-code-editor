import { languages } from '../core.js';

var comment = {
	pattern: /^[;#].*/m,
	greedy: true
};

var quotesSource = /"(?:[^\n"\\]|\\[\s\S])*"(?!\S)/.source;

languages.systemd = {
	'comment': comment,

	'section': {
		pattern: /^\[[^\n\[\]]*\](?=[ \t]*$)/m,
		greedy: true,
		inside: {
			'punctuation': /^\[|\]$/,
			'section-name': {
				pattern: /[\s\S]+/,
				alias: 'selector'
			},
		}
	},

	'key': {
		pattern: /^[^\s=]+(?=[ \t]*=)/m,
		greedy: true,
		alias: 'attr-name'
	},
	'value': {
		// This pattern is quite complex because of two properties:
		//  1) Quotes (strings) must be preceded by a space. Since we can't use lookbehinds, we have to "resolve"
		//     the lookbehind. You will see this in the main loop where spaces are handled separately.
		//  2) Line continuations.
		//     After line continuations, empty lines and comments are ignored so we have to consume them.
		pattern: RegExp(
			`(=[ \\t]*(?!\\s))(?:${quotesSource}|(?=[^"\n]))(?:[^\\s\\\\]|[ \t]+(?:(?![ \t"])|${quotesSource})|\\\\\n+(?:[#;].*\n+)*(?![#;]))*`, 'g'
		),
		lookbehind: true,
		greedy: true,
		alias: 'attr-value',
		inside: {
			'comment': comment,
			'quoted': {
				pattern: RegExp('(^|\\s)' + quotesSource, 'g'),
				lookbehind: true,
				greedy: true,
			},
			'punctuation': /\\$/m,

			'boolean': {
				pattern: /^(?:false|no|off|on|true|yes)$/,
				greedy: true
			}
		}
	},
	'punctuation': /=/
};
