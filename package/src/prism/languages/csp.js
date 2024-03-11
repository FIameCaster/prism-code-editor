import { languages } from '../core.js';

/** @param {string} pattern */
var value = pattern => RegExp('([ \t])(?:' + pattern + ')(?![^\\s;])', 'i');

languages.csp = {
	'directive': {
		pattern: /(^|[\s;])(?:base-uri|block-all-mixed-content|(?:child|connect|default|font|frame|img|manifest|media|object|prefetch|script|style|worker)-src|disown-opener|form-action|frame-(?:ancestors|options)|input-protection(?:-(?:clip|selectors))?|navigate-to|plugin-types|policy-uri|referrer|reflected-xss|report-(?:to|uri)|require-sri-for|sandbox|(?:script|style)-src-(?:attr|elem)|upgrade-insecure-requests)(?![^\s;])/i,
		lookbehind: true,
		alias: 'property'
	},
	'scheme': {
		pattern: value(/[a-z][a-z\d.+-]*:/.source),
		lookbehind: true
	},
	'none': {
		pattern: value(/'none'/.source),
		lookbehind: true,
		alias: 'keyword'
	},
	'nonce': {
		pattern: value(/'nonce-[\w=/+-]+'/.source),
		lookbehind: true,
		alias: 'number'
	},
	'hash': {
		pattern: value(/'sha(?:256|384|512)-[\w=/+-]+'/.source),
		lookbehind: true,
		alias: 'number'
	},
	'host': {
		pattern: value(
			/[a-z][a-z\d.+-]*:\/\/[^\s;,']*|\*[^\s;,']*|[a-z\d-]+(?:\.[a-z\d-]+)+(?::[\d*]+)?(?:\/[^\s;,']*)?/.source
		),
		lookbehind: true,
		alias: 'url',
		inside: {
			'important': /\*/
		}
	},
	'keyword': [
		{
			pattern: value(/'unsafe-[a-z-]+'/.source),
			lookbehind: true,
			alias: 'unsafe'
		},
		{
			pattern: value(/'[a-z-]+'/.source),
			lookbehind: true,
			alias: 'safe'
		},
	],
	'punctuation': /;/
};
