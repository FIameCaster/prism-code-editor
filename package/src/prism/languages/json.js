import { languages } from '../core.js';
import { boolean, clikeComment } from '../utils/patterns.js';

// https://www.json.org/json-en.html
languages.webmanifest = languages.json = {
	'property': {
		pattern: /"(?:\\.|[^\\\n"])*"(?=\s*:)/g,
		greedy: true
	},
	'string': {
		pattern: /"(?:\\.|[^\\\n"])*"/g,
		greedy: true
	},
	'comment': clikeComment(),
	'number': /-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i,
	'operator': /:/,
	'punctuation': /[[\]{},]/,
	'boolean': boolean,
	'null': {
		pattern: /\bnull\b/,
		alias: 'keyword'
	}
};
