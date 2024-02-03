import { languages } from '../core.js';
import { boolean, clikeNumber } from '../utils/shared.js';

var interpolationContent = {
	pattern: /^(..)[\s\S]+(?=.)/,
	lookbehind: true,
};

var percentExpression = /(?:([^a-zA-Z0-9\s{(\[<=])(?:(?!\1)[^\\]|\\[\s\S])*\1|\((?:[^()\\]|\\[\s\S]|\((?:[^()\\]|\\[\s\S])*\))*\)|\{(?:[^{}\\]|\\[\s\S]|\{(?:[^{}\\]|\\[\s\S])*\})*\}|\[(?:[^[\]\\]|\\[\s\S]|\[(?:[^[\]\\]|\\[\s\S])*\])*\]|<(?:[^<>\\]|\\[\s\S]|<(?:[^<>\\]|\\[\s\S])*>)*>)/.source;

var symbolName = /(?:"(?:\\.|[^"\\\n])*"|(?:\b[a-zA-Z_]\w*|[^\s\0-\x7F]+)[?!]?|\$.)/.source;

var interpolation = {
	pattern: /((?:^|[^\\])(?:\\{2})*)#\{(?:[^{}]|\{[^{}]*\})*\}/,
	lookbehind: true,
	inside: {
		'content': interpolationContent,
		'delimiter': {
			pattern: /.+/,
			alias: 'punctuation'
		}
	}
}

interpolationContent.inside = languages.rb = languages.ruby = {
	'comment': {
		pattern: /#.*|^=begin\s[\s\S]*?^=end/m,
		greedy: true
	},
	'string-literal': [
		{
			pattern: RegExp(/%[qQiIwWs]?/.source + percentExpression),
			greedy: true,
			inside: {
				'interpolation': interpolation,
				'string': /[\s\S]+/
			}
		},
		{
			pattern: /("|')(?:#\{[^}]+\}|#(?!\{)|\\[\s\S]|(?!\1)[^\\#\n])*\1/,
			greedy: true,
			inside: {
				'interpolation': interpolation,
				'string': /[\s\S]+/
			}
		},
		{
			pattern: /<<[-~]?([a-z_]\w*)\n(?:.*\n)*?[\t ]*\1/i,
			alias: 'heredoc-string',
			greedy: true,
			inside: {
				'delimiter': {
					pattern: /^<<[-~]?[a-z_]\w*|\b[a-z_]\w*$/i,
					inside: {
						'symbol': /\b\w+/,
						'punctuation': /^<<[-~]?/
					}
				},
				'interpolation': interpolation,
				'string': /[\s\S]+/
			}
		},
		{
			pattern: /<<[-~]?'([a-z_]\w*)'\n(?:.*\n)*?[\t ]*\1/i,
			alias: 'heredoc-string',
			greedy: true,
			inside: {
				'delimiter': {
					pattern: /^<<[-~]?'[a-z_]\w*'|\b[a-z_]\w*$/i,
					inside: {
						'symbol': /\b\w+/,
						'punctuation': /^<<[-~]?'|'$/,
					}
				},
				'string': /[\s\S]+/
			}
		}
	],
	'command-literal': [
		{
			pattern: RegExp(/%x/.source + percentExpression),
			greedy: true,
			inside: {
				'interpolation': interpolation,
				'command': {
					pattern: /[\s\S]+/,
					alias: 'string'
				}
			}
		},
		{
			pattern: /`(?:#\{[^}]+\}|#(?!\{)|\\[\s\S]|[^\\`#\n])*`/,
			greedy: true,
			inside: {
				'interpolation': interpolation,
				'command': {
					pattern: /[\s\S]+/,
					alias: 'string'
				}
			}
		}
	],
	'class-name': {
		pattern: /(\b(?:class|module)\s+|\bcatch\s+\()[\w.\\]+|\b[A-Z_]\w*(?=\s*\.\s*new\b)/,
		lookbehind: true,
		inside: {
			'punctuation': /[.\\]/
		}
	},
	'regex-literal': [
		{
			pattern: RegExp(`%r${percentExpression}[egimnosux]{0,6}`),
			greedy: true,
			inside: {
				'interpolation': interpolation,
				'regex': /[\s\S]+/
			}
		},
		{
			pattern: /(^|[^/])\/(?!\/)(?:\[[^\n\]]+\]|\\.|[^[/\\\n])+\/[egimnosux]{0,6}(?=\s*(?:$|[\n,.;})#]))/,
			lookbehind: true,
			greedy: true,
			inside: {
				'interpolation': interpolation,
				'regex': /[\s\S]+/
			}
		}
	],
	'variable': /[@$]+[a-zA-Z_]\w*(?:[?!]|\b)/,
	'symbol': [
		{
			pattern: RegExp(/(^|[^:]):/.source + symbolName),
			lookbehind: true,
			greedy: true
		},
		{
			pattern: RegExp(/([\n{(,][ \t]*)/.source + symbolName + /(?=:(?!:))/.source),
			lookbehind: true,
			greedy: true
		},
	],
	'method-definition': {
		pattern: /(\bdef\s+)\w+(?:\s*\.\s*\w+)?/,
		lookbehind: true,
		inside: {
			'function': /\b\w+$/,
			'keyword': /^self\b/,
			'class-name': /^\w+/,
			'punctuation': /\./
		}
	},
	'keyword': /\b(?:BEGIN|END|alias|and|begin|break|case|class|def|define_method|defined|do|each|else|elsif|end|ensure|extend|for|if|in|include|module|new|next|nil|not|or|prepend|private|protected|public|raise|redo|require|rescue|retry|return|self|super|then|throw|undef|unless|until|when|while|yield)\b/,
	'boolean': boolean,
	'builtin': /\b(?:Array|Bignum|Binding|Class|Continuation|Dir|Exception|FalseClass|File|Fixnum|Float|Hash|IO|Integer|MatchData|Method|Module|NilClass|Numeric|Object|Proc|Range|Regexp|Stat|String|Struct|Symbol|TMS|Thread|ThreadGroup|Time|TrueClass)\b/,
	'constant': /\b[A-Z][A-Z0-9_]*(?:[?!]|\b)/,
	'number': clikeNumber,
	'double-colon': {
		pattern: /::/,
		alias: 'punctuation'
	},
	'operator': /\.{2,3}|&\.|===|<?=>|[!=]?~|(?:&&|\|\||<<|>>|\*\*|[+\-*/%<>!^&|=])=?|[?:]/,
	'punctuation': /[(){}[\].,;]/,
};
