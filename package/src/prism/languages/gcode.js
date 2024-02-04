import { languages } from '../core.js';

languages.gcode = {
	'comment': /;.*|\B\(.*?\)\B/,
	'string': {
		pattern: /"(?:""|[^"])*"/g,
		greedy: true
	},
	'keyword': /\b[GM]\d+(?:\.\d+)?\b/,
	'property': /\b[A-Z]/,
	'checksum': {
		pattern: /(\*)\d+/,
		lookbehind: true,
		alias: 'number'
	},
	// T0:0:0
	'punctuation': /[:*]/
};
