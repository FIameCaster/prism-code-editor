import { languages, rest } from '../core.js';

var string = /(?:"(?:\\[\s\S]|[^"\\\n])*"|'(?:\\[\s\S]|[^'\\\n])*')/;
var stringSrc = string.source;

var atruleInside = {
	'rule': /^@[\w-]+/,
	'selector-function-argument': {
		pattern: /(\bselector\s*\(\s*(?![\s)]))(?:[^()\s]|\s+(?![\s)])|\((?:[^()]|\([^()]*\))*\))+(?=\s*\))/,
		lookbehind: true,
		alias: 'selector'
	},
	'keyword': {
		pattern: /(^|[^\w-])(?:and|not|only|or)(?![\w-])/,
		lookbehind: true
	}
	// See rest below
};

atruleInside[rest] = languages.css = {
	'comment': /\/\*[\s\S]*?\*\//,
	'atrule': {
		pattern: RegExp(`@[\\w-](?:[^;{\\s"']|\\s+(?!\\s)|${stringSrc})*?(?:;|(?=\\s*\\{))`),
		inside: atruleInside
	},
	'url': {
		// https://drafts.csswg.org/css-values-3/#urls
		pattern: RegExp(`\\burl\\((?:${stringSrc}|(?:[^\\\\\n()"']|\\\\[\\s\\S])*)\\)`, 'i'),
		greedy: true,
		inside: {
			'function': /^url/i,
			'punctuation': /^\(|\)$/,
			'string': {
				pattern: RegExp('^' + stringSrc + '$'),
				alias: 'url'
			}
		}
	},
	'selector': {
		pattern: RegExp(`(^|[{}\\s])[^{}\\s](?:[^{};"'\\s]|\\s+(?![\\s{])|${stringSrc})*(?=\\s*\\{)`),
		lookbehind: true
	},
	'string': {
		pattern: string,
		greedy: true
	},
	'property': {
		pattern: /(^|[^-\w\xA0-\uFFFF])(?!\d)(?:(?!\s)[-\w\xA0-\uFFFF])+(?=\s*:)/i,
		lookbehind: true
	},
	'important': /!important\b/i,
	'function': {
		pattern: /(^|[^-a-z0-9])[-a-z0-9]+(?=\()/i,
		lookbehind: true
	},
	'punctuation': /[(){};:,]/
};
