import { languages, rest } from '../core.js';
import { boolean, clikeComment } from '../utils/patterns.js';

languages.res = languages.rescript = {
	'comment': clikeComment(),
	'char': {
		pattern: /'(?:[^\\\n]|\\(?:.|\w+))'/g,
		greedy: true
	},
	'template-string': {
		pattern: /`(?:\\[\s\S]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})*\}|(?!\$\{)[^\\`])*`/g,
		greedy: true,
		inside: {
			'template-punctuation': {
				pattern: /^`|`$/,
				alias: 'string'
			},
			'interpolation': {
				pattern: /((?:^|[^\\])(?:\\\\)*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})*\}/,
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
		pattern: /"(?:\\[\s\S]|[^\\\n"])*"/g,
		greedy: true
	},
	'class-name': /\b[A-Z]\w*|@[a-z.]*|#[a-zA-Z]\w*|#\d/,
	'function': {
		pattern: /[a-zA-Z]\w*(?=\()|(\.)[a-z]\w*/,
		lookbehind: true,
	},
	'number': /(?:\b0x(?:[a-f\d]+(?:\.[a-f\d]*)?|\.[a-f\d]+)(?:p[+-]?\d+)?|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?)[ful]{0,4}/i,
	'boolean': boolean,
	'attr-value': /[a-zA-Z]\w*(?==)/,
	'constant': {
		pattern: /(\btype\s+)[a-z]\w*/,
		lookbehind: true
	},
	'tag': {
		pattern: /(<)[a-z]\w*|(?:<\/)[a-z]\w*/,
		lookbehind: true,
		inside: {
			'operator': /[<>/]/
		}
	},
	'keyword': /\b(?:and|as|assert|begin|bool|class|constraint|do|done|downto|else|end|exception|external|float|f?or|fun|function|if|include|inherit|initializer|int?|lazy|let|method|module|mutable|new|nonrec|object|of|open|private|rec|string|switch|[tw]hen|to|try|type|while|with)\b/,
	'operator': /\.{3}|:[:=]?|\|>|->|=>|==?=?|<=?|>=?|[~|^!?'#`]|[/*+-]\.?|\b(?:asr|land|ls[lr]|lx?or|mod)\b/,
	'punctuation': /[()[\]{}.,;]/
};
