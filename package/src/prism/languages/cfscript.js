import { languages } from '../core.js';
import { extend, insertBefore } from '../utils/language.js';
import './clike.js';

// https://cfdocs.org/script
var cfc = languages.cfc = languages.cfscript = extend('clike', {
	'comment': [
		{
			pattern: /\/\*[\s\S]*?(?:\*\/|$)/,
			inside: {
				'annotation': {
					pattern: /(?:^|[^.])@[\w\.]+/,
					alias: 'punctuation'
				}
			}
		},
		{
			pattern: /\/\/.*/g,
			greedy: true
		}
	],
	'keyword': /\b(?:abstract|break|catch|component|continue|default|do|else|extends|final|finally|for|function|if|in|include|package|private|property|public|remote|required|rethrow|return|static|switch|throw|try|var|while|xml)\b(?!\s*=)/,
	'operator': [
		/\+\+|--|&&|\|\||::|=>|[!=]==|[-+*/%&|^!=<>]=?|\?(?:\.|:)?|:/,
		/\b(?:and|contains|eq|equal|eqv|gt|gte|imp|is|lt|lte|mod|not|or|xor)\b/
	],
	'scope': {
		pattern: /\b(?:application|arguments|cgi|client|cookie|local|session|super|this|variables)\b/,
		alias: 'global'
	},
	'type': {
		pattern: /\b(?:any|array|binary|boolean|date|guid|numeric|query|string|struct|uuid|void|xml)\b/,
		alias: 'builtin'
	}
});

insertBefore(cfc, 'keyword', {
	// This must be declared before keyword because we use "function" inside the lookahead
	'function-variable': {
		pattern: /(?!\d)(?:(?!\s)[$\w\xA0-\uFFFF])+(?=\s*[=:]\s*(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|(?!\d)(?:(?!\s)[$\w\xA0-\uFFFF])+)\s*=>))/,
		alias: 'function'
	}
});

delete cfc['class-name'];
