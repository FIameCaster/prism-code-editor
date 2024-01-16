import { languages } from '../core.js';

languages.awk = {
	'hashbang': {
		pattern: /^#!.*/,
		greedy: true,
		alias: 'comment'
	},
	'comment': {
		pattern: /#.*/,
		greedy: true
	},
	'string': {
		pattern: /(^|[^\\])"(?:[^\\"\n]|\\.)*"/,
		lookbehind: true,
		greedy: true
	},
	'regex': {
		pattern: /((?:^|[^\w\s)])\s*)\/(?:[^\/\\\n]|\\.)*\//,
		lookbehind: true,
		greedy: true
	},

	'variable': /\$\w+/,
	'keyword': /\b(?:BEGIN|BEGINFILE|END|ENDFILE|break|case|continue|default|delete|do|else|exit|for|function|getline|if|in|next|nextfile|printf?|return|switch|while)\b|@(?:include|load)\b/,

	'function': /\b[a-z_]\w*(?=\s*\()/i,
	'number': /\b(?:\d+(?:\.\d+)?(?:e[+-]?\d+)?|0x[a-fA-F0-9]+)\b/,

	'operator': /--|\+\+|!?~|>&|>>|<<|(?:\*\*|[<>!=+\-*/%^])=?|&&|\|[|&]|[?:]/,
	'punctuation': /[()[\]{},;]/
};

languages.gawk = languages.awk;