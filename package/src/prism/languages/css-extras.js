import { languages } from '../core.js';
import { insertBefore } from '../utils/language.js';
import './css.js';

var css = languages.css;
var unit = {
	pattern: /(\b\d+)(?:%|[a-z]+(?![\w-]))/,
	lookbehind: true
};
// 123 -123 .123 -.123 12.3 -12.3
var number = {
	pattern: /(^|[^\w.-])-?(?:\d+(?:\.\d+)?|\.\d+)/,
	lookbehind: true
};

css.selector.inside = css['atrule'].inside['selector-function-argument'].inside = {
	'pseudo-element': /:(?:after|before|first-letter|first-line|selection)|::[-\w]+/,
	'pseudo-class': /:[-\w]+/,
	'class': /\.[-\w]+/,
	'id': /#[-\w]+/,
	'attribute': {
		pattern: /\[(?:[^[\]"']|("|')(?:\\[\s\S]|(?!\1)[^\\\n])*\1)*\]/,
		greedy: true,
		inside: {
			'punctuation': /^\[|\]$/,
			'case-sensitivity': {
				pattern: /(\s)[si]$/i,
				lookbehind: true,
				alias: 'keyword'
			},
			'namespace': {
				pattern: /^(\s*)(?:(?!\s)[-*\w\xA0-\uFFFF])*\|(?!=)/,
				lookbehind: true,
				inside: {
					'punctuation': /\|$/
				}
			},
			'attr-name': {
				pattern: /^(\s*)(?:(?!\s)[-\w\xA0-\uFFFF])+/,
				lookbehind: true
			},
			'attr-value': [
				/("|')(?:\\[\s\S]|(?!\1)[^\\\n])*\1/,
				{
					pattern: /(=\s*)(?:(?!\s)[-\w\xA0-\uFFFF])+(?=\s*$)/,
					lookbehind: true
				}
			],
			'operator': /[|~*^$]?=/
		}
	},
	'n-th': [
		{
			pattern: /(\(\s*)[+-]?\d*[\dn](?:\s*[+-]\s*\d+)?(?=\s*\))/,
			lookbehind: true,
			inside: {
				'number': /[\dn]+/,
				'operator': /[+-]/
			}
		},
		{
			pattern: /(\(\s*)(?:even|odd)(?=\s*\))/i,
			lookbehind: true
		}
	],
	'combinator': />|\+|~|\|\|/,

	// the `tag` token has been existed and removed.
	// because we can't find a perfect tokenize to match it.
	// if you want to add it, please read https://github.com/PrismJS/prism/pull/2373 first.

	'punctuation': /[(),]/,
};

insertBefore(css, 'property', {
	'variable': {
		pattern: /(^|[^-\w\xA0-\uFFFF])--(?!\d)(?:(?!\s)[-\w\xA0-\uFFFF])*/i,
		lookbehind: true
	}
});

insertBefore(css, 'function', {
	'operator': {
		pattern: /(\s)[+\-*\/](?=\s)/,
		lookbehind: true
	},
	// CAREFUL!
	// Previewers and Inline color use hexcode and color.
	'hexcode': {
		pattern: /\B#[\da-f]{3,8}\b/i,
		alias: 'color'
	},
	'color': [
		{
			pattern: /(^|[^\w-])(?:aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|(?:dark)?(?:blue|cyan|goldenrod|gr[ae]y|green|khaki|magenta|olivegreen|orange|orchid|red|salmon|seagreen|slateblue|slategr[ae]y|turquoise|violet)|deeppink|deepskyblue|dimgr[ae]y|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|greenyellow|honeydew|hotpink|indianred|indigo|ivory|lavender|lavenderblush|lawngreen|lemonchiffon|light(?:blue|coral|cyan|goldenrodyellow|gr[ae]y|green|pink|salmon|seagreen|skyblue|slategr[ae]y|steelblue|yellow)|lime|limegreen|linen|maroon|medium(?:aquamarine|blue|orchid|purple|seagreen|slateblue|springgreen|turquoise|violetred)|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orangered|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|rebeccapurple|rosybrown|royalblue|saddlebrown|sandybrown|seashell|sienna|silver|skyblue|snow|springgreen|steelblue|tan|teal|thistle|tomato|transparent|wheat|white|whitesmoke|yellow|yellowgreen)(?![\w-])/i,
			lookbehind: true
		},
		{
			pattern: /\b(?:hsl|rgb)\(\s*\d{1,3}\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*\)\B|\b(?:hsl|rgb)a\(\s*\d{1,3}\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*,\s*(?:0|0?\.\d+|1)\s*\)\B/i,
			inside: {
				'function': /^[^(]+/,
				'unit': unit,
				'number': number,
				'punctuation': /[(),]/
			}
		}
	],
	// it's important that there is no boundary assertion after the hex digits
	'entity': /\\[\da-f]{1,8}/i,
	'unit': unit,
	'number': number
});
