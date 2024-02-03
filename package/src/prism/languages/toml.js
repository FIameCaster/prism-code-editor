import { languages } from '../core.js';
import { boolean } from '../utils/shared.js';

/**
 * @param {string} pattern
 */
var insertKey = pattern =>
	pattern.replace(/__/g, `(?:[\\w-]+|'[^'\n]*'|"(?:\\\\.|[^\\\\"\n])*")`);

languages.toml = {
	'comment': {
		pattern: /#.*/,
		greedy: true
	},
	'table': {
		pattern: RegExp(insertKey(/(^[\t ]*\[\s*(?:\[\s*)?)__(?:\s*\.\s*__)*(?=\s*\])/.source), 'm'),
		lookbehind: true,
		greedy: true,
		alias: 'class-name'
	},
	'key': {
		pattern: RegExp(insertKey(/(^[\t ]*|[{,]\s*)__(?:\s*\.\s*__)*(?=\s*=)/.source), 'm'),
		lookbehind: true,
		greedy: true,
		alias: 'property'
	},
	'string': {
		pattern: /"""(?:\\[\s\S]|[^\\])*?"""|'''[\s\S]*?'''|'[^'\n]*'|"(?:\\.|[^\\"\n])*"/,
		greedy: true
	},
	'date': [
		{
			// Offset Date-Time, Local Date-Time, Local Date
			pattern: /\b\d{4}-\d{2}-\d{2}(?:[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)?\b/i,
			alias: 'number'
		},
		{
			// Local Time
			pattern: /\b\d{2}:\d{2}:\d{2}(?:\.\d+)?\b/,
			alias: 'number'
		}
	],
	'number': /(?:\b0(?:x[\da-zA-Z]+(?:_[\da-zA-Z]+)*|o[0-7]+(?:_[0-7]+)*|b[10]+(?:_[10]+)*))\b|[-+]?\b\d+(?:_\d+)*(?:\.\d+(?:_\d+)*)?(?:[eE][+-]?\d+(?:_\d+)*)?\b|[-+]?\b(?:inf|nan)\b/,
	'boolean': boolean,
	'punctuation': /[.,=[\]{}]/
};
