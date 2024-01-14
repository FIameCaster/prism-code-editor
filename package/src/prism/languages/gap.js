import { languages } from '../core.js';

// https://www.gap-system.org/Manuals/doc/ref/chap4.html
// https://www.gap-system.org/Manuals/doc/ref/chap27.html

var gap = {
	pattern: /^(gap>).+(?:\n>.*)*/,
	lookbehind: true
};

gap.inside = languages.gap = {
	'shell': {
		pattern: /^gap>[\s\S]*?(?=^gap>|$(?![\s\S]))/m,
		greedy: true,
		inside: {
			'gap': gap,
			'punctuation': /^gap>/
		}
	},

	'comment': {
		pattern: /#.*/,
		greedy: true
	},
	'string': {
		pattern: /(^|[^\\'"])(?:'(?:[^\n\\']|\\.){1,10}'|"(?:[^\n\\"]|\\.)*"(?!")|"""[\s\S]*?""")/,
		lookbehind: true,
		greedy: true,
		inside: {
			'continuation': {
				pattern: /^>/m,
				alias: 'punctuation'
			}
		}
	},

	'keyword': /\b(?:Assert|Info|IsBound|QUIT|TryNextMethod|Unbind|and|atomic|break|continue|do|elif|else|end|fi|for|function|if|in|local|mod|not|od|or|quit|readonly|readwrite|rec|repeat|return|then|until|while)\b/,
	'boolean': /\b(?:false|true)\b/,

	'function': /\b[a-z_]\w*(?=\s*\()/i,

	'number': {
		pattern: /(^|[^\w.]|\.\.)(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?(?:_[a-z]?)?(?=$|[^\w.]|\.\.)/,
		lookbehind: true
	},

	'continuation': {
		pattern: /^>/m,
		alias: 'punctuation'
	},
	'operator': /->|[-+*/^~=!]|<>|[<>]=?|:=|\.\./,
	'punctuation': /[()[\]{},;.:]/
};
