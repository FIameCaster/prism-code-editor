import { languages } from '../core.js';

languages.lua = {
	'comment': /^#!.+|--(?:\[(=*)\[[\s\S]*?\]\1\]|.*)/m,
	// \z may be used to skip the following space
	'string': {
		pattern: /(["'])(?:(?!\1)[^\\\n]|\\z\s|\\[^z])*\1|\[(=*)\[[\s\S]*?\]\2\]/g,
		greedy: true
	},
	'number': /\b0x[a-f\d]+(?:\.[a-f\d]*)?(?:p[+-]?\d+)?\b|\b\d+(?:\.\B|(?:\.\d*)?(?:e[+-]?\d+)?\b)|\B\.\d+(?:e[+-]?\d+)?\b/i,
	'keyword': /\b(?:and|break|do|else|elseif|end|false|true|f?or|function|goto|if|in|local|nil|not|repeat|return|then|until|while)\b/,
	'function': /(?!\d)\w+(?=\s*(?:[({]))/,
	// Match ".." but don't break "..."
	'operator': {
		pattern: /[%&|^#*+-]|\/\/?|<[<=]?|>[>=]?|[=~]=?|(^|[^.])\.\.(?!\.)/,
		lookbehind: true
	},
	'punctuation': /[()[\]{},;]|\.+|:+/
};
