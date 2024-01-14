import { languages, rest } from '../core.js';

var js = {};

languages.js = languages.javascript = Object.assign(js, {
	'comment': {
		pattern: /\/\/.*|\/\*[\s\S]*?(?:\*\/|$)/,
		greedy: true
	},
	'hashbang': {
		pattern: /^#!.*/,
		greedy: true,
		alias: 'comment'
	},
	'template-string': {
		pattern: /`(?:\\[\s\S]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})*\}|(?!\$\{)[^\\`])*`/g,
		greedy: true,
		inside: {
			'template-punctuation': {
				pattern: /^`|`$/,
				alias: 'string'
			},
			interpolation: {
				pattern: /((?:^|[^\\])(?:\\{2})*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})*\}/,
				lookbehind: true,
				inside: {
					'interpolation-punctuation': {
						pattern: /^\$\{|\}$/,
						alias: 'punctuation'
					},
					[rest]: js
				}
			},
			'string': /[\s\S]+/
		}
	},
	'string-property': {
		pattern: /((?:^|[,{])[ \t]*)(["'])(?:\\[\s\S]|(?!\2)[^\\\n])*\2(?=\s*:)/m,
		lookbehind: true,
		greedy: true,
		alias: 'property'
	},
	'string': {
		pattern: /(["'])(?:\\[\s\S]|(?!\1)[^\\\n])*\1/,
		greedy: true
	},
	'class-name': [
		{
			pattern: /(\b(?:class|extends|implements|instanceof|interface|new)\s+)(?!\d)(?:(?!\s)[$\w.\\\xA0-\uFFFF])+/,
			lookbehind: true,
			inside: {
				punctuation: /[.\\]/
			}
		},
		{
			pattern: /(^|[^$\w\xA0-\uFFFF]|\s)(?![\da-z])(?:(?!\s)[$\w\xA0-\uFFFF])+(?=\.(?:constructor|prototype)\b)/,
			lookbehind: true
		}
	],
	'regex': {
		pattern: /((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)\/(?:(?:\[(?:[^\]\\\n]|\\.)*\]|\\.|[^/\\\[\n])+\/[dgimyus]{0,7}|(?:\[(?:[^[\]\\\n]|\\.|\[(?:[^[\]\\\n]|\\.|\[(?:[^[\]\\\n]|\\.)*\])*\])*\]|\\.|[^/\\\[\n])+\/[dgimyus]{0,7}v[dgimyus]{0,7})(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\n,.;:})\]]|\/\/))/,
		lookbehind: true,
		greedy: true,
		inside: {
			'regex-flags': /\w+$/,
			'regex-delimiter': /^\/|\/$/,
			'regex-source': {
				pattern: /[\s\S]+/,
				alias: 'language-regex',
				inside: 'regex'
			}
		}
	},
	// This must be declared before keyword because we use "function" inside the look-forward
	'function-variable': {
		pattern: /#?(?!\d)(?:(?!\s)[$\w\xA0-\uFFFF])+(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|(?!\d)(?:(?!\s)[$\w\xA0-\uFFFF])+)\s*=>))/,
		alias: 'function',
		inside: {
			'maybe-class-name': /^[A-Z].*/
		}
	},
	'parameter': [
		/(function(?:\s+(?!\d)(?:(?!\s)[$\w\xA0-\uFFFF])+)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/,
		/(^|[^$\w\xA0-\uFFFF]|\s)(?!\d)(?:(?!\s)[$\w\xA0-\uFFFF])+(?=\s*=>)/,
		/(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,
		/((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\d)(?:(?!\s)[$\w\xA0-\uFFFF])+\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/
	].map(pattern => ({
		pattern,
		lookbehind: true,
		inside: js
	})),
	'constant': /\b[A-Z](?:[A-Z_]|\dx?)*\b/,
	'keyword': [
		{
			pattern: /(^|[^.]|\.\.\.\s*)\b(?:as|assert(?=\s*\{)|export|from(?=\s*(?:['"]|$))|import)\b/,
			alias: 'module',
			lookbehind: true
		},
		{
			pattern: /(^|[^.]|\.\.\.\s*)\b(?:await|break|case|catch|continue|do|default|else|finally|for|if|return|switch|throw|try|while|yield)\b/,
			alias: 'control-flow',
			lookbehind: true
		},
		{
			pattern: /(^|[^.]|\.\.\.\s*)\b(?:async(?=\s*(?:[($\w\xA0-\uFFFF]|$))|class|const|debugger|delete|enum|extends|function|(?:get|set)(?=\s*(?:[#[$\w\xA0-\uFFFF]|$))|implements|in|instanceof|interface|let|new|null|of|package|private|protected|public|static|super|this|typeof|undefined|var|void|with)\b/,
			lookbehind: true
		}
	],
	'boolean': /\b(?:false|true)\b/,
	// Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
	'function': {
		pattern: /#?(?!\d)(?:(?!\s)[$\w\xA0-\uFFFF])+(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,
		inside: {
			'maybe-class-name': /^[A-Z].*/
		}
	},
	'number': {
		pattern: /(^|[^\w$])(?:NaN|Infinity|0[bB][01]+(?:_[01]+)*n?|0[oO][0-7]+(?:_[0-7]+)*n?|0[xX][\dA-Fa-f]+(?:_[\dA-Fa-f]+)*n?|\d+(?:_\d+)*n|(?:\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\.\d+(?:_\d+)*)(?:[Ee][+-]?\d+(?:_\d+)*)?)(?![\w$])/,
		lookbehind: true
	},
	'literal-property': {
		pattern: /((?:^|[,{])[ \t]*)(?!\d)(?:(?!\s)[$\w\xA0-\uFFFF])+(?=\s*:)/m,
		lookbehind: true,
		alias: 'property'
	},
	'property-access': {
		pattern: /(\.\s*)#?(?!\d)(?:(?!\s)[$\w\xA0-\uFFFF])+/,
		lookbehind: true,
		inside: {
			'maybe-class-name': /^[A-Z].*/
		}
	},
	'maybe-class-name': {
		pattern: /(^|[^$\w\xA0-\uFFFF])[A-Z][$\w\xA0-\uFFFF]+/,
		lookbehind: true
	},
	'arrow': {
		pattern: /=>/,
		alias: 'operator'
	},
	'operator': /--|\+\+|(?:\*\*|&&|\|\||[!=]=?|<<|>>>?|[-+*/%&|^<>]|\?\?)=?|\.{3},\?\.?|~|:/,
	'punctuation': /[{}[\];(),.:]/
});
