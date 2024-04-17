import { languages } from '../core.js';
import { boolean, clikePunctuation } from '../utils/patterns.js';

languages.squirrel = {
	'comment': {
		pattern: /\/\*[\s\S]*?(?:\*\/|$)|\/\/.*|#.*/g,
		greedy: true
	},
	'char': {
		pattern: /(^|[^\\"'])'(?:[^\\']|\\(?:[xuU][a-fA-F\d]{0,8}|[\s\S]))'/g,
		lookbehind: true,
		greedy: true
	},
	'string': {
		pattern: /(^|[^\\"'@])(?:@"(?:[^"]|"")*"(?!")|"(?:\\.|[^\\\n"])*")/g,
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
	'boolean': boolean,
	'function': /\b\w+(?=\()/,
	'number': /\b(?:0x[a-fA-F\d]+|\d+(?:\.(?:\d+|[eE][+-]?\d+))?)\b/,
	'attribute-punctuation': {
		pattern: /<\/|\/>/,
		alias: 'important'
	},
	'lambda': {
		pattern: /@(?=\()/,
		alias: 'operator'
	},
	'operator': /--|\+\+|<=>|<[-<]|>>>?|&&?|\|\|?|[%!=<>/*+-]=?|[~^]|::?/,
	'punctuation': clikePunctuation
};
