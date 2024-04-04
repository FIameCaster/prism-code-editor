import { languages } from '../core.js';
import { extend, insertBefore } from '../utils/language.js';
import './clike.js';

// https://cfdocs.org/script
var cfc = languages.cfc = languages.cfscript = extend('clike', {
	'comment': [
		/\/\/.*/,
		{
			pattern: /\/\*[\s\S]*?(?:\*\/|$)/g,
			greedy: true,
			inside: {
				'annotation': {
					pattern: /(?:^|[^.])@[\w\.]+/,
					alias: 'punctuation'
				}
			}
		},
	],
	'keyword': /\b(?:abstract|break|catch|component|continue|default|do|else|extends|final|finally|for|function|if|in|include|package|private|property|public|remote|required|rethrow|return|static|switch|throw|try|var|while|xml)\b(?!\s*=)/,
	'operator': /--|\+\+|&&|\|\||::|=>|[!=]==|[%&|^!=<>/*+-]=?|\?[.:]?|:|\b(?:and|contains|equal|eqv?|[gl]te?|imp|is|mod|not|x?or)\b/,
	'scope': {
		pattern: /\b(?:application|arguments|cgi|client|cookie|local|session|super|this|variables)\b/,
		alias: 'global'
	},
	'type': {
		pattern: /\b(?:any|array|binary|boolean|date|[gu]uid|numeric|query|string|struct|void|xml)\b/,
		alias: 'builtin'
	}
});

insertBefore(cfc, 'keyword', {
	// This must be declared before keyword because we use "function" inside the lookahead
	'function-variable': {
		pattern: /(?!\d)(?:(?!\s)[$\w\xa0-\uffff])+(?=\s*[=:]\s*(?:\bfunction\b|(?:\((?:[^()]|\([^)]*\))*\)|(?!\d)(?:(?!\s)[$\w\xa0-\uffff])+)\s*=>))/,
		alias: 'function'
	}
});

delete cfc['class-name'];
