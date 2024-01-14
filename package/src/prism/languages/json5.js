import { languages } from '../core.js';
import { extend } from '../utils/language.js';
import './json.js';

var string = /("|')(?:\\(?:\r\n?|\n|.)|(?!\1)[^\\\r\n])*\1/;

languages.json5 = extend('json', {
	'property': [
		{
			pattern: RegExp(string.source + '(?=\\s*:)'),
			greedy: true
		},
		{
			pattern: /(?!\d)(?:(?!\s)[$\w\xA0-\uFFFF])+(?=\s*:)/,
			alias: 'unquoted'
		}
	],
	'string': {
		pattern: string,
		greedy: true
	},
	'number': /[+-]?\b(?:NaN|Infinity|0x[a-fA-F\d]+)\b|[+-]?(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:[eE][+-]?\d+\b)?/
});
