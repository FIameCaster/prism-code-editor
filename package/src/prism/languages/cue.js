import { languages } from '../core.js';
import { re } from '../utils/shared.js';

// https://cuelang.org/docs/references/spec/

// eslint-disable-next-line regexp/strict
var stringEscape = /\\(?:(?!\2)|\2(?:[^()\n]|\([^()]*\)))/.source;
var stringLiteral = re(`(^|[^#"'\\\\])(#*)(?:"""(?:[^\\\\"]|"(?!""\\2)|<0>)*"""|'''(?:[^\\\\']|'(?!''\\2)|<0>)*'''|"(?:[^\\\\\n"]|"(?!\\2)|<0>)*"|'(?:[^\\\\\n']|'(?!\\2)|<0>)*')(?!["'])\\2`, [stringEscape], 'g');

var expression = {
	pattern: /[\s\S]+/
}

expression.inside = languages.cue = {
	'comment': /\/\/.*/,
	'string-literal': {
		pattern: stringLiteral,
		lookbehind: true,
		greedy: true,
		inside: {
			// I'm using dirty hack here. We have to know the number hashes at the start of the string somehow,
			// but we can't look back. So instead, we will use a lookahead, go to the end of the string, and
			// capture the hashes at the end of the string.
			'escape': {
				pattern: /(?=[\s\S]*["'](#*)$)\\\1(?:U[a-fA-F\d]{1,8}|u[a-fA-F\d]{1,4}|x[a-fA-F\d]{1,2}|\d{2,3}|[^(])/g,
				greedy: true,
				alias: 'string'
			},
			'interpolation': {
				pattern: /(?=[\s\S]*["'](#*)$)\\\1\([^()]*\)/g,
				greedy: true,
				inside: {
					'punctuation': /^\\#*\(|\)$/,
					'expression': expression
				}
			},
			'string': /[\s\S]+/
		}
	},

	'keyword': {
		pattern: /(^|[^$\w])(?:for|if|import|in|let|null|package)(?![$\w])/,
		lookbehind: true
	},
	'boolean': {
		pattern: /(^|[^$\w])(?:false|true)(?![$\w])/,
		lookbehind: true
	},
	'builtin': {
		pattern: /(^|[^$\w])(?:bool|bytes|float(?:32|64)?|u?int(?:8|16|32|64|128)?|number|rune|string)(?![$\w])/,
		lookbehind: true
	},

	'attribute': {
		pattern: /@[$\w]+(?=\s*\()/,
		alias: 'function'
	},
	'function': {
		pattern: /(^|[^$\w])[a-z_$][$\w]*(?=\s*\()/i,
		lookbehind: true
	},

	'number': {
		pattern: /(^|[^$\w.])(?:0b[01]+(?:_[01]+)*|0o[0-7]+(?:_[0-7]+)*|0[xX][a-fA-F\d]+(?:_[a-fA-F\d]+)*|(?:\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\.\d+(?:_\d+)*)(?:[eE][+-]?\d+(?:_\d+)*)?(?:[KMGTP]i?)?)(?![$\w])/,
		lookbehind: true
	},

	'operator': /\.{3}|_\|_|&&?|\|\|?|[!=]~|[<>!=]=?|[?/*+-]/,
	'punctuation': /[()[\]{}.,:]/
};
