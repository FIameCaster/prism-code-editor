import { languages } from '../core.js';
import { clikeComment } from '../utils/shared.js';

languages.haxe = {
	'comment': clikeComment(),
	'string-interpolation': {
		pattern: /'(?:[^'\\]|\\[\s\S])*'/,
		greedy: true,
		inside: {
			'interpolation': {
				pattern: /(^|[^\\])\$(?:\w+|\{[^{}]+\})/,
				lookbehind: true,
				inside: {
					'interpolation-punctuation': {
						pattern: /^\$\{?|\}$/,
						alias: 'punctuation'
					},
					'expression': {
						pattern: /[\s\S]+/,
						inside: 'haxe'
					},
				}
			},
			'string': /[\s\S]+/
		}
	},
	'string': {
		// Strings can be multi-line
		pattern: /"(?:[^"\\]|\\[\s\S])*"/,
		greedy: true
	},
	'regex': {
		pattern: /~\/(?:[^\/\\\r\n]|\\.)+\/[a-z]*/,
		greedy: true,
		inside: {
			'regex-flags': /\w+$/,
			'regex-delimiter': /^~\/|\/$/,
			'regex-source': {
				pattern: /[\s\S]+/,
				alias: 'language-regex',
				inside: 'regex'
			},
		}
	},
	'class-name': [
		{
			pattern: /(\b(?:abstract|class|enum|extends|implements|interface|new|typedef)\s+)[A-Z_]\w*/,
			lookbehind: true,
		},
		// based on naming convention
		/\b[A-Z]\w*/
	],
	'preprocessor': {
		pattern: /#(?:else|elseif|end|if)\b.*/,
		alias: 'property'
	},
	'metadata': {
		pattern: /@:?[\w.]+/,
		alias: 'symbol'
	},
	'reification': {
		pattern: /\$(?:\w+|(?=\{))/,
		alias: 'important'
	},
	// The final look-ahead prevents highlighting of keywords if expressions such as "haxe.macro.Expr"
	'keyword': /\bthis\b|\b(?:abstract|as|break|case|cast|catch|class|continue|default|do|dynamic|else|enum|extends|extern|final|for|from|function|if|implements|import|in|inline|interface|macro|new|null|operator|overload|override|package|private|public|return|static|super|switch|throw|to|try|typedef|untyped|using|var|while)(?!\.)\b/,
	'boolean': /\b(?:false|true)\b/,
	'function': {
		pattern: /\b[a-z_]\w*(?=\s*(?:<[^<>]*>\s*)?\()/i,
		greedy: true
	},
	'number': /\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,
	'operator': /\.{3}|\+\+|--|&&|\|\||->|=>|(?:<<?|>{1,3}|[-+*/%!=&|^])=?|[?:~]/,
	'punctuation': /[{}[\];(),.:]/
};
