import { languages, rest } from '../core.js';
import { boolean, clikeComment } from '../utils/shared.js';

var unit = {
	pattern: /(\b\d+)(?:%|[a-z]+)/,
	lookbehind: true
};
// 123 -123 .123 -.123 12.3 -12.3
var number = {
	pattern: /(^|[^\w.-])-?(?:\d+(?:\.\d+)?|\.\d+)/,
	lookbehind: true
};

var comment = clikeComment();

var inside = {
	'comment': comment,
	'url': {
		pattern: /\burl\((["']?).*?\1\)/ig,
		greedy: true
	},
	'string': {
		pattern: /(["'])(?:\\[\s\S]|(?!\1)[^\\\n])*\1/g,
		greedy: true
	},
	'interpolation': null, // See below
	'func': null, // See below
	'important': /\B!(?:important|optional)\b/i,
	'keyword': {
		pattern: /(^|\s+)(?:(?:else|for|if|return|unless)(?=\s|$)|@[\w-]+)/,
		lookbehind: true
	},
	'hexcode': /#[a-f\d]{3,6}/i,
	'color': [
		/\b(?:aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|(?:dark)?(?:blue|cyan|goldenrod|gr[ae]y|green|khaki|magenta|olivegreen|orange|orchid|red|salmon|seagreen|slateblue|slategr[ae]y|turquoise|violet)|deeppink|deepskyblue|dimgr[ae]y|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|greenyellow|honeydew|hotpink|indianred|indigo|ivory|lavender|lavenderblush|lawngreen|lemonchiffon|light(?:blue|coral|cyan|goldenrodyellow|gr[ae]y|green|pink|salmon|seagreen|skyblue|slategr[ae]y|steelblue|yellow)|lime|limegreen|linen|maroon|medium(?:aquamarine|blue|orchid|purple|seagreen|slateblue|springgreen|turquoise|violetred)|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orangered|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|rosybrown|royalblue|saddlebrown|sandybrown|seashell|sienna|silver|skyblue|snow|springgreen|steelblue|tan|teal|thistle|tomato|transparent|wheat|white|whitesmoke|yellow|yellowgreen)\b/i,
		{
			pattern: /\b(?:hsl|rgb)\(\s*\d{1,3}\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*\)\B|\b(?:hsl|rgb)a\(\s*\d{1,3}\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*,\s*(?:0|0?\.\d+|1)\s*\)\B/i,
			inside: {
				'unit': unit,
				'number': number,
				'function': /[\w-]+(?=\()/,
				'punctuation': /[(),]/
			}
		}
	],
	'entity': /\\[a-f\d]{1,8}/i,
	'unit': unit,
	'boolean': boolean,
	// We want non-word chars around "-" because it is
	// accepted in property names.
	'operator': /~|\*\*|[?%!=<>/*+]=?|[-:]=|\.{2,3}|&&|\|\||\B-\B|\b(?:and|in|is(?: a| defined| not|nt)?|not|or)\b/,
	'number': number,
	'punctuation': /[()[\]{},:;]/
};

var interpolation = inside['interpolation'] = {
	pattern: /\{[^\n}:]+\}/,
	alias: 'variable',
	inside: {
		'delimiter': {
			pattern: /^\{|\}$/,
			alias: 'punctuation'
		},
		[rest]: inside
	}
};

var func = inside['func'] = {
	pattern: /[\w-]+\([^)]*\).*/,
	inside: {
		'function': /^[^(]+/,
		[rest]: inside
	}
};

languages.stylus = {
	'atrule-declaration': {
		pattern: /(^[ \t]*)@.+/m,
		lookbehind: true,
		inside: {
			'atrule': /^@[\w-]+/,
			[rest]: inside
		}
	},
	'variable-declaration': {
		pattern: /(^[ \t]*)[$\w-]+\s*.?=[ \t]*(?:\{[^{}]*\}|\S.*|$)/m,
		lookbehind: true,
		inside: {
			'variable': /^\S+/,
			[rest]: inside
		}
	},

	'statement': {
		pattern: /(^[ \t]*)(?:else|for|if|return|unless)[ \t].+/m,
		lookbehind: true,
		inside: {
			'keyword': /^\S+/,
			[rest]: inside
		}
	},

	// A property/value pair cannot end with a comma or a brace
	// It cannot have indented content unless it ended with a semicolon
	'property-declaration': {
		pattern: /((?:^|\{)([ \t]*))(?:[\w-]|\{[^\n}]+\})+(?:\s*:\s*|[ \t]+)(?!\s)[^\n{]*(?:;|[^\n{,]$(?!\n(?:\{|\2[ \t])))/m,
		lookbehind: true,
		inside: {
			'property': {
				pattern: /^[^\s:]+/,
				inside: {
					'interpolation': interpolation
				}
			},
			[rest]: inside
		}
	},


	// A selector can contain parentheses only as part of a pseudo-element
	// It can span multiple lines.
	// It must end with a comma or an accolade or have indented content.
	'selector': {
		pattern: /(^[ \t]*)(?:(?!\s)(?:[^(){}\n:]|::?[\w-]+(?:\([^\n)]*\)|(?![\w-]))|\{[^\n}]+\})+)(?:\n(?:\1(?:(?!\s)(?:[^(){}\n:]|::?[\w-]+(?:\([^\n)]*\)|(?![\w-]))|\{[^\n}]+\})+)))*(?:,$|\{|(?=\n(?:\{|\1[ \t])))/m,
		lookbehind: true,
		inside: {
			'interpolation': interpolation,
			'comment': comment,
			'punctuation': /[{},]/
		}
	},

	'func': func,
	'string': inside.string,
	'comment': comment,
	'interpolation': interpolation,
	'punctuation': /[()[\]{}.:;]/
};
