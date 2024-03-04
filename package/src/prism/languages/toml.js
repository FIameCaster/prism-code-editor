import { languages } from '../core.js';
import { boolean, re } from '../utils/shared.js';

/** @param {string} pattern */
var insertKey = pattern => re(pattern, [`(?:[\\w-]+|'[^\n']*'|"(?:\\\\.|[^\\\\"\n])*")`], 'mg');

languages.toml = {
	'comment': {
		pattern: /#.*/g,
		greedy: true
	},
	'table': {
		pattern: insertKey(/(^[\t ]*\[\s*(?:\[\s*)?)<0>(?:\s*\.\s*<0>)*(?=\s*\])/.source),
		lookbehind: true,
		greedy: true,
		alias: 'class-name'
	},
	'key': {
		pattern: insertKey(/(^[\t ]*|[{,]\s*)<0>(?:\s*\.\s*<0>)*(?=\s*=)/.source),
		lookbehind: true,
		greedy: true,
		alias: 'property'
	},
	'string': {
		pattern: /"""(?:\\[\s\S]|[^\\])*?"""|'''[\s\S]*?'''|'[^\n']*'|"(?:\\.|[^\\\n"])*"/g,
		greedy: true
	},
	'date': [
		{
			// Offset Date-Time, Local Date-Time, Local Date
			pattern: /\b\d{4}-\d{2}-\d{2}(?:[t\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:z|[+-]\d{2}:\d{2})?)?\b/i,
			alias: 'number'
		},
		{
			// Local Time
			pattern: /\b\d{2}:\d{2}:\d{2}(?:\.\d+)?\b/,
			alias: 'number'
		}
	],
	'number': /(?:\b0(?:x[a-zA-Z\d]+(?:_[a-zA-Z\d]+)*|o[0-7]+(?:_[0-7]+)*|b[10]+(?:_[10]+)*))\b|[+-]?\b\d+(?:_\d+)*(?:\.\d+(?:_\d+)*)?(?:[eE][+-]?\d+(?:_\d+)*)?\b|[+-]?\b(?:inf|nan)\b/,
	'boolean': boolean,
	'punctuation': /[[\]{}.,=]/
};
