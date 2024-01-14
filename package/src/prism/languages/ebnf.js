import { languages } from '../core.js';

languages.ebnf = {
	'comment': /\(\*[\s\S]*?\*\)/,
	'string': {
		pattern: /"[^"\n]*"|'[^'\n]*'/,
		greedy: true
	},
	'special': {
		pattern: /\?[^?\n]*\?/,
		greedy: true,
		alias: 'class-name'
	},

	'definition': {
		pattern: /^([\t ]*)[a-z]\w*(?:[ \t]+[a-z]\w*)*(?=\s*=)/im,
		lookbehind: true,
		alias: 'rule keyword'
	},
	'rule': /\b[a-z]\w*(?:[ \t]+[a-z]\w*)*\b/i,

	'punctuation': /\([:/]|[:/]\)|[.,;()[\]{}]/,
	'operator': /[-=|*/!]/
};
