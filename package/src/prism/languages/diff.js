import { languages } from '../core.js';

var diff = languages.diff = {
	// Match all kinds of coord lines (prefixed by "+++", "---" or "***").
	// Match "@@ ... @@" coord lines in unified diff.
	// Match coord lines in normal diff (starts with a number).
	'coord': /^(?:\*{3}|-{3}|\+{3}|\d).*$|^@@.*@@$/m

	// deleted, inserted, unchanged, diff
};

/**
 * A map from the name of a block to its line prefix.
 *
 * @type {Object<string, string>}
 */
var PREFIXES = {
	'deleted-sign': '-',
	'deleted-arrow': '<',
	'inserted-sign': '+',
	'inserted-arrow': '>',
	'unchanged': ' ',
	'diff': '!',
};

// add a token for each prefix
for (var name in PREFIXES) {

	var prefix = name.split('-')[0];

	diff[name] = {
		pattern: RegExp('^(?:[' + PREFIXES[name] + '].*$\n?)+', 'm'),
		alias: prefix != name ? prefix : name == 'diff' ? 'bold' : undefined,
		inside: {
			'prefix': {
				pattern: RegExp('^[' + PREFIXES[name] + ']', 'mg'),
				greedy: true,
				alias: prefix
			}
		}
	};

};
