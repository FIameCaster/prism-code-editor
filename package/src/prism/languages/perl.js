import { languages } from '../core.js';

var brackets = /(?:\((?:\\[\s\S]|[^\\()])*\)|\{(?:\\[\s\S]|[^\\{}])*\}|\[(?:\\[\s\S]|[^\\[\]])*\]|<(?:\\[\s\S]|[^\\<>])*>)/.source;

var a = '(?![a-zA-Z\d])\\s*(?:([^a-zA-Z\d\\s{([<])(?:\\\\[\\s\\S]|(?!\\1)[^\\\\])*\\1|([a-zA-Z\d])(?:\\\\[\\s\\S]|(?!\\2)[^\\\\])*\\2';

languages.perl = {
	'comment': [
		{
			// POD
			pattern: /(^\s*)=\w[\s\S]*?=cut.*/mg,
			lookbehind: true,
			greedy: true
		},
		{
			pattern: /(^|[^\\$])#.*/g,
			lookbehind: true,
			greedy: true
		}
	],
	// TODO Could be nice to handle Heredoc too.
	'string': {
		pattern: RegExp(
			`\\bq[qwx]?${a}|${brackets})|("|\`)(?:\\\\[\\s\\S]|(?!\\3)[^\\\\])*\\3|'(?:\\\\.|[^\\\\\n'])*'`, 'g'
		),
		greedy: true
	},
	'regex': [
		{
			pattern: RegExp(
				`\\b(?:m|qr)${a}|${brackets})[msixpodualngc]*`, 'g'
			),
			greedy: true
		},

		// The lookbehinds prevent -s from breaking
		{
			pattern: RegExp(
				`(^|[^-])\\b(?:s|tr|y)(?![a-zA-Z\d])\\s*(?:([^a-zA-Z\d\\s{([<])(?:\\\\[\\s\\S]|(?!\\2)[^\\\\])*\\2(?:\\\\[\\s\\S]|(?!\\2)[^\\\\])*\\2|([a-zA-Z\d])(?:\\\\[\\s\\S]|(?!\\3)[^\\\\])*\\3(?:\\\\[\\s\\S]|(?!\\3)[^\\\\])*\\3|${brackets}\\s*${brackets})[msixpodualngcer]*`, 'g'
			),
			lookbehind: true,
			greedy: true
		},

		// /.../
		// The look-ahead tries to prevent two divisions on
		// the same line from being highlighted as regex.
		// This does not support multi-line regex.
		{
			pattern: /\/(?:\\.|[^\\\n/])*\/[msixpodualngc]*(?=\s*(?:$|[\n,.;})&|*~<>!?^+-]|(?:and|cmp|eq|[gl][et]|ne|not|x|x?or)\b))/g,
			greedy: true
		}
	],

	// FIXME Not sure about the handling of ::, ', and #
	'variable': /[&*$@%](?:\{\^[A-Z]+\}|\^[A-Z_]|#?(?=\{)|#?(?:(?:::)*'?(?!\d)[$\w]+(?![$\w]))+(?:::)*|\d+)|(?!%=)[$@%][!"#$%&'*,./:;<=>?@()[\]{}||^_`|~+-]/,
	'filehandle': {
		// <>, <FOO>, _
		pattern: /<(?![<=])\S*?>|\b_\b/,
		alias: 'symbol'
	},
	'v-string': {
		// v1.2, 1.2.3
		pattern: /v\d+(?:\.\d+)*|\d+(?:\.\d+){2,}/,
		alias: 'string'
	},
	'function': {
		pattern: /(\bsub[ \t]+)\w+/,
		lookbehind: true
	},
	'keyword': /\b(?:any|break|continue|default|delete|die|do|else|elsif|eval|for|foreach|given|goto|if|last|local|my|next|our|package|print|redo|require|return|say|state|sub|switch|undef|unless|until|use|when|while)\b/,
	'number': /\b(?:0x[a-fA-F\d](?:_?[a-fA-F\d])*|0b[01](?:_?[01])*|(?:(?:\d(?:_?\d)*)?\.)?\d(?:_?\d)*(?:[Ee][+-]?\d+)?)\b/,
	'operator': /-[rwxoRWXOezsfdlpSbctugkTBMAC]\b|->|=>|=~|~~|<=>?|!~|--|\+\+|(?:\*\*|\/\/|&&|\|\||<<|>>|[~%&|^!=<>/*+-])=?|\.(?:=|\.\.?)?|[\\?]|\bx(?:=|\b)|\b(?:and|cmp|eq|[gl][et]|ne|not|x?or)\b/,
	'punctuation': /[()[\]{},:;]/
};
