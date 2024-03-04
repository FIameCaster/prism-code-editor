import { languages } from '../core.js';

languages.editorconfig = {
	// https://editorconfig-specification.readthedocs.io
	'comment': /[;#].*/,
	'section': {
		pattern: /(^[ \t]*)\[.+\]/m,
		lookbehind: true,
		alias: 'selector',
		inside: {
			'regex': /\\\\[[\]{}.,?!*]/, // Escape special characters with '\\'
			'operator': /[!?]|\.\.|\*\*?/,
			'punctuation': /[[\]{},]/
		}
	},
	'key': {
		pattern: /(^[ \t]*)[^\s=]+(?=[ \t]*=)/m,
		lookbehind: true,
		alias: 'attr-name'
	},
	'value': {
		pattern: /=.*/,
		alias: 'attr-value',
		inside: {
			'punctuation': /^=/
		}
	}
};
