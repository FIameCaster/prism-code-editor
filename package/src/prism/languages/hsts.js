import { languages } from '../core.js';

/**
 * Original by Scott Helme.
 *
 * Reference: https://scotthelme.co.uk/hsts-cheat-sheet/
 */

languages.hsts = {
	'directive': {
		pattern: /\b(?:includesubdomains|max-age|preload)(?![^\s;=])/i,
		alias: 'property'
	},
	'operator': /=/,
	'punctuation': /;/
};
