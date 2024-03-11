import { languages } from '../core.js';

/**
 * Original by Scott Helme.
 *
 * Reference: https://scotthelme.co.uk/hpkp-cheat-sheet/
 */

languages.hpkp = {
	'directive': {
		pattern: /\b(?:includesubdomains|max-age|pin-sha256|preload|report-to|report-uri|strict)(?![^\s;=])/i,
		alias: 'property'
	},
	'operator': /=/,
	'punctuation': /;/
};
