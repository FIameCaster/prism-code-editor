import { languages } from '../core.js';
import { boolean } from '../utils/shared.js';

languages.rip = {
	'comment': {
		pattern: /#.*/g,
		greedy: true
	},

	'char': {
		pattern: /\B`[^\s`'",.:;#\/\\()<>[\]{}]\b/g,
		greedy: true
	},
	'string': {
		pattern: /("|')(?:\\.|(?!\1)[^\\\n])*\1/g,
		greedy: true
	},

	'regex': {
		pattern: /(^|[^/])\/(?!\/)(?:\[[^\n\]]*\]|\\.|[^/\\\n\[])+\/(?=\s*(?:$|[\n,.;})]))/g,
		lookbehind: true,
		greedy: true
	},

	'keyword': /(?:=>|->)|\b(?:case|catch|class|else|exit|finally|if|raise|return|switch|try)\b/,

	'builtin': /@|\bSystem\b/,

	'boolean': boolean,

	'date': /\b\d{4}-\d{2}-\d{2}\b/,
	'time': /\b\d{2}:\d{2}:\d{2}\b/,
	'datetime': /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\b/,

	'symbol': /:[^\d\s`'",.:;#\/\\()<>[\]{}][^\s`'",.:;#\/\\()<>[\]{}]*/,
	'number': /[+-]?\b(?:\d+\.\d+|\d+)\b/,

	'punctuation': /(?:\.{2,3})|[`,.:;=\/\\()<>[\]{}]/,

	'reference': /[^\d\s`'",.:;#\/\\()<>[\]{}][^\s`'",.:;#\/\\()<>[\]{}]*/
};
