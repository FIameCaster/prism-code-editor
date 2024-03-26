import { languages } from '../core.js';
import { extend, insertBefore } from '../utils/language.js';
import './clike.js';

var chaiscript = languages.chaiscript = extend('clike', {
	'string': {
		pattern: /(^|[^\\])'(?:\\[\s\S]|[^\\'])*'/g,
		lookbehind: true,
		greedy: true
	},
	'class-name': [
		{
			// e.g. class Rectangle { ... }
			pattern: /(\bclass\s+)\w+/,
			lookbehind: true
		},
		{
			// e.g. attr Rectangle::height, def Rectangle::area() { ... }
			pattern: /(\b(?:attr|def)\s+)\w+(?=\s*::)/,
			lookbehind: true
		}
	],
	'keyword': /\b(?:attr|auto|break|case|catch|class|continue|def|default|else|finally|for|fun|global|if|return|switch|this|try|var|while)\b/,
	'number': [
		{
			pattern: /(?:\b0b[01']+|\b0x(?:[a-f\d']+(?:\.[a-f\d']*)?|\.[a-f\d']+)(?:p[+-]?[\d']+)?|(?:\b[\d']+(?:\.[\d']*)?|\B\.[\d']+)(?:e[+-]?[\d']+)?)[ful]{0,4}/gi,
			greedy: true
		},
		/\b(?:Infinity|NaN)\b/
	],
	'operator': /:[:=]|--|\+\+|&&|\|\||>>=?|<<=?|[%&|^!=<>/*+-]=?|[?:~]|`[^\n`]{1,4}`/,
});

insertBefore(chaiscript, 'operator', {
	'parameter-type': {
		// e.g. def foo(int x, Vector y) {...}
		pattern: /([,(]\s*)\w+(?=\s+\w)/,
		lookbehind: true,
		alias: 'class-name'
	},
});

insertBefore(chaiscript, 'string', {
	'string-interpolation': {
		pattern: /(^|[^\\])"(?:\\[\s\S]|[^\\$"]|\$(?!\{)|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})*\})*"/g,
		lookbehind: true,
		greedy: true,
		inside: {
			'interpolation': {
				pattern: /((?:^|[^\\])(?:\\\\)*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})*\}/,
				lookbehind: true,
				inside: {
					'interpolation-expression': {
						pattern: /(..)[\s\S]+(?=.)/,
						lookbehind: true,
						inside: chaiscript
					},
					'interpolation-punctuation': {
						pattern: /.+/,
						alias: 'punctuation'
					}
				}
			},
			'string': /[\s\S]+/
		}
	},
});
