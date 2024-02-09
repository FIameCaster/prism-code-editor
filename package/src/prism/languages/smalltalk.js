import { languages } from '../core.js';
import { boolean } from '../utils/shared.js';

languages.smalltalk = {
	'comment': {
		pattern: /"(?:""|[^"])*"/g,
		greedy: true
	},
	'char': {
		pattern: /\$./g,
		greedy: true
	},
	'string': {
		pattern: /'(?:''|[^'])*'/g,
		greedy: true
	},
	'symbol': /#[\da-z]+|#(?:-|([+\/\\*~<>=@%|&?!])\1?)|#(?=\()/i,
	'block-arguments': {
		pattern: /(\[\s*):[^\[|]*\|/,
		lookbehind: true,
		inside: {
			'variable': /:[\da-z]+/i,
			'punctuation': /\|/
		}
	},
	'temporary-variables': {
		pattern: /\|[^|]+\|/,
		inside: {
			'variable': /[\da-z]+/i,
			'punctuation': /\|/
		}
	},
	'keyword': /\b(?:new|nil|self|super)\b/,
	'boolean': boolean,
	'number': [
		/\d+r-?[\dA-Z]+(?:\.[\dA-Z]+)?(?:e-?\d+)?/,
		/\b\d+(?:\.\d+)?(?:e-?\d+)?/
	],
	'operator': /[<=]=?|:=|~[~=]|\/\/?|\\\\|>[>=]?|[!^+\-*&|,@]/,
	'punctuation': /[.;:?[\](){}]/
};
