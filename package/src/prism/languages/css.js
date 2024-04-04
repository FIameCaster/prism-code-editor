import { languages, rest } from '../core.js';

var string = /(?:"(?:\\[\s\S]|[^\\\n"])*"|'(?:\\[\s\S]|[^\\\n'])*')/g;
var stringSrc = string.source;

var atruleInside = {
	'rule': /^@[\w-]+/,
	'selector-function-argument': {
		pattern: /(\bselector\s*\(\s*(?![\s)]))(?:[^()\s]|\s+(?![\s)])|\((?:[^()]|\([^)]*\))*\))+(?=\s*\))/,
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
		pattern: RegExp(`\\burl\\((?:${stringSrc}|(?:[^\\\\\n"')=]|\\\\[\\s\\S])*)\\)`, 'gi'),
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
		pattern: /(^|[^-\w\xa0-\uffff])(?!\d)(?:(?!\s)[-\w\xa0-\uffff])+(?=\s*:)/i,
		lookbehind: true
	},
	'important': /!important\b/i,
	'function': {
		pattern: /(^|[^-a-z\d])[-a-z\d]+(?=\()/i,
		lookbehind: true
	},
	'punctuation': /[(){},:;]/
};
