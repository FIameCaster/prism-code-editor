import { languages, rest } from '../core.js';
import { clikeComment } from '../utils/shared.js';

languages.res = languages.rescript = {
	'comment': clikeComment(),
	'char': {
		pattern: /'(?:[^\n\\]|\\(?:.|\w+))'/,
		greedy: true
	},
	'template-string': {
		pattern: /`(?:\\[\s\S]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|(?!\$\{)[^\\`])*`/,
		greedy: true,
		inside: {
			'template-punctuation': {
				pattern: /^`|`$/,
				alias: 'string'
			},
			'interpolation': {
				pattern: /((?:^|[^\\])(?:\\{2})*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/,
				lookbehind: true,
				inside: {
					'interpolation-punctuation': {
						pattern: /^\$\{|\}$/,
						alias: 'tag'
					},
					[rest]: 'res'
				}
			},
			'string': /[\s\S]+/
		}
	},
	'string': {
		pattern: /"(?:\\[\s\S]|[^\\\n"])*"/,
		greedy: true
	},
	'class-name': /\b[A-Z]\w*|@[a-z.]*|#[A-Za-z]\w*|#\d/,
	'function': {
		pattern: /[a-zA-Z]\w*(?=\()|(\.)[a-z]\w*/,
		lookbehind: true,
	},
	'number': /(?:\b0x(?:[\da-f]+(?:\.[\da-f]*)?|\.[\da-f]+)(?:p[+-]?\d+)?|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?)[ful]{0,4}/i,
	'boolean': /\b(?:false|true)\b/,
	'attr-value': /[A-Za-z]\w*(?==)/,
	'constant': {
		pattern: /(\btype\s+)[a-z]\w*/,
		lookbehind: true
	},
	'tag': {
		pattern: /(<)[a-z]\w*|(?:<\/)[a-z]\w*/,
		lookbehind: true,
		inside: {
			'operator': /<|>|\//,
		},
	},
	'keyword': /\b(?:and|as|assert|begin|bool|class|constraint|do|done|downto|else|end|exception|external|float|for|fun|function|if|in|include|inherit|initializer|int|lazy|let|method|module|mutable|new|nonrec|object|of|open|or|private|rec|string|switch|then|to|try|type|when|while|with)\b/,
	'operator': /\.{3}|:[:=]?|\|>|->|=(?:==?|>)?|<=?|>=?|[|^?'#!~`]|[+\-*\/]\.?|\b(?:asr|land|lor|lsl|lsr|lxor|mod)\b/,
	'punctuation': /[(){}[\],;.]/
};