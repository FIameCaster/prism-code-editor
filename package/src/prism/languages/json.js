import { languages } from '../core.js';
import { boolean, clikeComment } from '../utils/shared.js';

// https://www.json.org/json-en.html
languages.webmanifest = languages.json = {
	'property': {
		pattern: /(^|[^\\])"(?:\\.|[^\\"\n])*"(?=\s*:)/,
		lookbehind: true,
		greedy: true
	},
	'string': {
		pattern: /(^|[^\\])"(?:\\.|[^\\"\n])*"(?!\s*:)/,
		lookbehind: true,
		greedy: true
	},
	'comment': clikeComment(),
	'number': /-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i,
	'operator': /:/,
	'punctuation': /[{}[\],]/,
	'boolean': boolean,
	'null': {
		pattern: /\bnull\b/,
		alias: 'keyword'
	}
};
