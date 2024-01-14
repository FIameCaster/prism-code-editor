import { languages } from '../core.js';

/**
 * @param {RegExp} reg
 * @returns {RegExp}
 */
var value = reg =>
	RegExp('([ \\t])(?:' + reg.source + ')(?=[\\s;]|$)', 'i');

languages.csp = {
	'directive': {
		pattern: /(^|[\s;])(?:base-uri|block-all-mixed-content|(?:child|connect|default|font|frame|img|manifest|media|object|prefetch|script|style|worker)-src|disown-opener|form-action|frame-(?:ancestors|options)|input-protection(?:-(?:clip|selectors))?|navigate-to|plugin-types|policy-uri|referrer|reflected-xss|report-(?:to|uri)|require-sri-for|sandbox|(?:script|style)-src-(?:attr|elem)|upgrade-insecure-requests)(?=[\s;]|$)/i,
		lookbehind: true,
		alias: 'property'
	},
	'scheme': {
		pattern: value(/[a-z][a-z0-9.+-]*:/),
		lookbehind: true
	},
	'none': {
		pattern: value(/'none'/),
		lookbehind: true,
		alias: 'keyword'
	},
	'nonce': {
		pattern: value(/'nonce-[-+/\w=]+'/),
		lookbehind: true,
		alias: 'number'
	},
	'hash': {
		pattern: value(/'sha(?:256|384|512)-[-+/\w=]+'/),
		lookbehind: true,
		alias: 'number'
	},
	'host': {
		pattern: value(
			/[a-z][a-z0-9.+-]*:\/\/[^\s;,']*|\*[^\s;,']*|[a-z0-9-]+(?:\.[a-z0-9-]+)+(?::[\d*]+)?(?:\/[^\s;,']*)?/
		),
		lookbehind: true,
		alias: 'url',
		inside: {
			'important': /\*/
		}
	},
	'keyword': [
		{
			pattern: value(/'unsafe-[a-z-]+'/),
			lookbehind: true,
			alias: 'unsafe'
		},
		{
			pattern: value(/'[a-z-]+'/),
			lookbehind: true,
			alias: 'safe'
		},
	],
	'punctuation': /;/
};
