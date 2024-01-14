import { languages } from '../core.js';

languages.squirrel = {
	'comment': {
		pattern: /\/\*[\s\S]*?(?:\*\/|$)|(?:\/\/|#).*/,
		greedy: true
	},
	'char': {
		pattern: /(^|[^\\"'])'(?:[^\\']|\\(?:[xuU][0-9a-fA-F]{0,8}|[\s\S]))'/,
		lookbehind: true,
		greedy: true
	},
	'string': {
		pattern: /(^|[^\\"'@])(?:@"(?:[^"]|"")*"(?!")|"(?:[^\\\r\n"]|\\.)*")/,
		lookbehind: true,
		greedy: true
	},

	'class-name': {
		pattern: /(\b(?:class|enum|extends|instanceof)\s+)\w+(?:\.\w+)*/,
		lookbehind: true,
		inside: {
			'punctuation': /\./
		}
	},
	'keyword': /\b(?:__FILE__|__LINE__|base|break|case|catch|class|clone|const|constructor|continue|default|delete|else|enum|extends|for|foreach|function|if|in|instanceof|local|null|resume|return|static|switch|this|throw|try|typeof|while|yield)\b/,
	'boolean': /\b(?:false|true)\b/,
	'function': /\b\w+(?=\()/,
	'number': /\b(?:0x[0-9a-fA-F]+|\d+(?:\.(?:\d+|[eE][+-]?\d+))?)\b/,
	'attribute-punctuation': {
		pattern: /<\/|\/>/,
		alias: 'important'
	},
	'lambda': {
		pattern: /@(?=\()/,
		alias: 'operator'
	},
	'operator': /\+\+|--|<=>|<[-<]|>>>?|&&?|\|\|?|[-+*/%!=<>]=?|[~^]|::?/,
	'punctuation': /[(){}\[\],;.]/
};
