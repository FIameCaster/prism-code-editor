import { languages } from '../core.js';

var comment = {
	pattern: /^[;#].*/mg,
	greedy: true
};

var quotesSource = /"(?:\\[\s\S]|[^\\\n"])*"(?!\S)/.source;

languages.systemd = {
	'comment': comment,

	'section': {
		pattern: /^\[[^\n[\]]*\](?=[ \t]*$)/mg,
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
		pattern: /^[^\s=]+(?=[ \t]*=)/mg,
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
			`(=[ \t]*(?!\\s))(?:[^\\\\\\s]|[ \t]+(?:(?![ \t"])|${quotesSource})|\\\\\n+(?:[#;].*\n+)*(?![#;]))+`, 'g'
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
				pattern: /^(?:false|true|no|off|on|yes)$/g,
				greedy: true
			}
		}
	},
	'punctuation': /=/
};
