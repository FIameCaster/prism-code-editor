import { languages, tokenize, tokenizeText } from '../core.js';
import { clikePunctuation } from '../utils/shared.js';
import { embeddedIn } from '../utils/templating.js';
import './markup.js';

var comment = /\/\*[\s\S]*?\*\/|\/\/.*|#(?!\[).*/;
var constant = [
	{
		pattern: /\b(?:false|true)\b/i,
		alias: 'boolean'
	},
	{
		pattern: /(::\s*)\b[a-z_]\w*\b(?!\s*\()/gi,
		greedy: true,
		lookbehind: true,
	},
	{
		pattern: /(\b(?:case|const)\s+)\b[a-z_]\w*(?=\s*[;=])/gi,
		greedy: true,
		lookbehind: true,
	},
	/\b(?:null)\b/i,
	/\b[A-Z_][A-Z0-9_]*\b(?!\s*\()/,
];
var number = /\b0b[01]+(?:_[01]+)*\b|\b0o[0-7]+(?:_[0-7]+)*\b|\b0x[\da-f]+(?:_[\da-f]+)*\b|(?:\b\d+(?:_\d+)*\.?(?:\d+(?:_\d+)*)?|\B\.\d+)(?:e[+-]?\d+)?/i;
var operator = /<?=>|\?\?=?|\.{3}|\??->|[!=]=?=?|::|\*\*=?|--|\+\+|&&|\|\||<<|>>|[?~]|[/^|%*&<>.+-]=?/;
var stringInterpolation = {
	pattern: /\{\$(?:\{(?:\{[^{}]+\}|[^{}]+)\}|[^{}])+\}|(^|[^\\{])\$+(?:\w+(?:\[[^\n[\]]+\]|->\w+)?)/,
	lookbehind: true
};
var string = [
	{
		pattern: /<<<'([^']+)'\n(?:.*\n)*?\1;/g,
		alias: 'nowdoc-string',
		greedy: true,
		inside: {
			'delimiter': {
				pattern: /^<<<'[^']+'|[a-z_]\w*;$/i,
				alias: 'symbol',
				inside: {
					'punctuation': /^<<<'?|[';]$/
				}
			}
		}
	},
	{
		pattern: /<<<(?:"([^"]+)"\n(?:.*\n)*?\1;|([a-z_]\w*)\n(?:.*\n)*?\2;)/gi,
		alias: 'heredoc-string',
		greedy: true,
		inside: {
			'delimiter': {
				pattern: /^<<<(?:"[^"]+"|[a-z_]\w*)|[a-z_]\w*;$/i,
				alias: 'symbol',
				inside: {
					'punctuation': /^<<<"?|[";]$/
				}
			},
			'interpolation': stringInterpolation
		}
	},
	{
		pattern: /`(?:\\[\s\S]|[^\\`])*`/g,
		alias: 'backtick-quoted-string',
		greedy: true
	},
	{
		pattern: /'(?:\\[\s\S]|[^\\'])*'/g,
		alias: 'single-quoted-string',
		greedy: true
	},
	{
		pattern: /"(?:\\[\s\S]|[^\\"])*"/g,
		alias: 'double-quoted-string',
		greedy: true,
		inside: {
			'interpolation': stringInterpolation
		}
	}
];

var php = stringInterpolation.inside = {
	'delimiter': {
		pattern: /\?>$|^<\?(?:php(?=\s)|=)?/i,
		alias: 'important'
	},
	'doc-comment': {
		pattern: /\/\*\*(?!\/)[\s\S]*?\*\//g,
		greedy: true,
		alias: 'comment',
		inside: 'phpdoc'
	},
	'comment': comment,
	'string': string,
	'attribute': {
		pattern: /#\[(?:[^"'\/#]|\/(?![*/])|\/\/.*$|#(?!\[).*$|\/\*(?:[^*]|\*(?!\/))*\*\/|"(?:\\[\s\S]|[^\\"])*"|'(?:\\[\s\S]|[^\\'])*')+\](?=\s*[a-z$#])/img,
		greedy: true,
		inside: {
			'attribute-content': {
				pattern: /^(..)[\s\S]+(?=.)/,
				lookbehind: true,
				// inside can appear subset of php
				inside: {
					'comment': comment,
					'string': string,
					'attribute-class-name': [
						{
							pattern: /([^:]|^)\b[a-z_]\w*(?!\\)\b/gi,
							alias: 'class-name',
							greedy: true,
							lookbehind: true
						},
						{
							pattern: /([^:]|^)(?:\\?\b[a-z_]\w*)+/gi,
							alias: 'class-name class-name-fully-qualified',
							greedy: true,
							lookbehind: true,
							inside: {
								'punctuation': /\\/
							}
						}
					],
					'constant': constant,
					'number': number,
					'operator': operator,
					'punctuation': clikePunctuation
				}
			},
			'delimiter': {
				pattern: /.+/,
				alias: 'punctuation'
			}
		}
	},
	'variable': /\$+(?:\w+\b|(?=\{))/,
	'package': {
		pattern: /(namespace\s+|use\s+(?:function\s+)?)(?:\\?\b[a-z_]\w*)+\b(?!\\)/i,
		lookbehind: true,
		inside: {
			'punctuation': /\\/
		}
	},
	'class-name-definition': {
		pattern: /(\b(?:class|enum|interface|trait)\s+)\b[a-z_]\w*(?!\\)\b/i,
		lookbehind: true,
		alias: 'class-name'
	},
	'function-definition': {
		pattern: /(\bfunction\s+)[a-z_]\w*(?=\s*\()/i,
		lookbehind: true,
		alias: 'function'
	},
	'keyword': [
		{
			pattern: /(\(\s*)\b(?:array|bool|boolean|float|int|integer|object|string)\b(?=\s*\))/gi,
			alias: 'type-casting',
			greedy: true,
			lookbehind: true
		},
		{
			pattern: /([(,?]\s*)\b(?:array(?!\s*\()|bool|callable|(?:false|null)(?=\s*\|)|float|int|iterable|mixed|object|self|static|string)\b(?=\s*\$)/gi,
			alias: 'type-hint',
			greedy: true,
			lookbehind: true
		},
		{
			pattern: /(\)\s*:\s*(?:\?\s*)?)\b(?:array(?!\s*\()|bool|callable|(?:false|null)(?=\s*\|)|float|int|iterable|mixed|never|object|self|static|string|void)\b/gi,
			alias: 'return-type',
			greedy: true,
			lookbehind: true
		},
		{
			pattern: /\b(?:array(?!\s*\()|bool|float|int|iterable|mixed|object|string|void)\b/gi,
			alias: 'type-declaration',
			greedy: true
		},
		{
			pattern: /(\|\s*)(?:false|null)\b|\b(?:false|null)(?=\s*\|)/gi,
			alias: 'type-declaration',
			greedy: true,
			lookbehind: true
		},
		{
			pattern: /\b(?:parent|self|static)(?=\s*::)/gi,
			alias: 'static-context',
			greedy: true
		},
		{
			// yield from
			pattern: /(\byield\s+)from\b/gi,
			lookbehind: true
		},
		// `class` is always a keyword unlike other keywords
		/\bclass\b/i,
		{
			// https://www.php.net/manual/en/reserved.keywords.php
			//
			// keywords cannot be preceded by "->"
			// the complex lookbehind means `(?<!(?:->|::)\s*)`
			pattern: /((?:^|[^\s>:]|(?:^|[^-])>|(?:^|[^:]):)\s*)\b(?:abstract|and|array|as|break|callable|case|catch|clone|const|continue|declare|default|die|do|echo|else|elseif|empty|enddeclare|endfor|endforeach|endif|endswitch|endwhile|enum|eval|exit|extends|final|finally|fn|for|foreach|function|global|goto|if|implements|include|include_once|instanceof|insteadof|interface|isset|list|match|namespace|never|new|or|parent|print|private|protected|public|readonly|require|require_once|return|self|static|switch|throw|trait|try|unset|use|var|while|xor|yield|__halt_compiler)\b/i,
			lookbehind: true
		}
	],
	'argument-name': {
		pattern: /([(,]\s*)\b[a-z_]\w*(?=\s*:(?!:))/i,
		lookbehind: true
	},
	'class-name': [
		{
			pattern: /(\b(?:extends|implements|instanceof|new(?!\s+self|\s+static))\s+|\bcatch\s*\()\b[a-z_]\w*(?!\\)\b/gi,
			greedy: true,
			lookbehind: true
		},
		{
			pattern: /(\|\s*)\b[a-z_]\w*(?!\\)\b/gi,
			greedy: true,
			lookbehind: true
		},
		{
			pattern: /\b[a-z_]\w*(?!\\)\b(?=\s*\|)/gi,
			greedy: true
		},
		{
			pattern: /(\|\s*)(?:\\?\b[a-z_]\w*)+\b/gi,
			alias: 'class-name-fully-qualified',
			greedy: true,
			lookbehind: true,
			inside: {
				'punctuation': /\\/
			}
		},
		{
			pattern: /(?:\\?\b[a-z_]\w*)+\b(?=\s*\|)/gi,
			alias: 'class-name-fully-qualified',
			greedy: true,
			inside: {
				'punctuation': /\\/
			}
		},
		{
			pattern: /(\b(?:extends|implements|instanceof|new(?!\s+self\b|\s+static\b))\s+|\bcatch\s*\()(?:\\?\b[a-z_]\w*)+\b(?!\\)/gi,
			alias: 'class-name-fully-qualified',
			greedy: true,
			lookbehind: true,
			inside: {
				'punctuation': /\\/
			}
		},
		{
			pattern: /\b[a-z_]\w*(?=\s*\$)/gi,
			alias: 'type-declaration',
			greedy: true
		},
		{
			pattern: /(?:\\?\b[a-z_]\w*)+(?=\s*\$)/gi,
			alias: 'class-name-fully-qualified type-declaration',
			greedy: true,
			inside: {
				'punctuation': /\\/
			}
		},
		{
			pattern: /\b[a-z_]\w*(?=\s*::)/gi,
			alias: 'static-context',
			greedy: true
		},
		{
			pattern: /(?:\\?\b[a-z_]\w*)+(?=\s*::)/gi,
			alias: 'class-name-fully-qualified static-context',
			greedy: true,
			inside: {
				'punctuation': /\\/
			}
		},
		{
			pattern: /([(,?]\s*)[a-z_]\w*(?=\s*\$)/gi,
			alias: 'type-hint',
			greedy: true,
			lookbehind: true
		},
		{
			pattern: /([(,?]\s*)(?:\\?\b[a-z_]\w*)+(?=\s*\$)/gi,
			alias: 'class-name-fully-qualified type-hint',
			greedy: true,
			lookbehind: true,
			inside: {
				'punctuation': /\\/
			}
		},
		{
			pattern: /(\)\s*:\s*(?:\?\s*)?)\b[a-z_]\w*(?!\\)\b/gi,
			alias: 'return-type',
			greedy: true,
			lookbehind: true
		},
		{
			pattern: /(\)\s*:\s*(?:\?\s*)?)(?:\\?\b[a-z_]\w*)+\b(?!\\)/gi,
			alias: 'class-name-fully-qualified return-type',
			greedy: true,
			lookbehind: true,
			inside: {
				'punctuation': /\\/
			}
		}
	],
	'constant': constant,
	'function': {
		pattern: /(^|[^\\\w])\\?[a-z_](?:[\w\\]*\w)?(?=\s*\()/i,
		lookbehind: true,
		inside: {
			'punctuation': /\\/
		}
	},
	'property': {
		pattern: /(->\s*)\w+/,
		lookbehind: true
	},
	'number': number,
	'operator': operator,
	'punctuation': clikePunctuation
};

var embedded = embeddedIn('html');

languages.php = {
	'php': {
		pattern: /<\?(?:[^"'/#]|\/(?![*/])|("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|(?:\/\/|#(?!\[))(?:[^?\n]|\?(?!>))*(?=$|\?>|\n)|#\[|\/\*(?:[^*]|\*(?!\/))*(?:\*\/|$))*?(?:\?>|$)/,
		inside: php
	},
	[tokenize]: (code, grammar) => {
		if (code.includes("<?")) return embedded(code, grammar);
		return tokenizeText(code, php);
	}
};
