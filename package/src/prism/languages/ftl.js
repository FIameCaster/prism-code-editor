import { languages, rest, tokenize } from '../core.js';
import { embeddedIn } from '../utils/templating.js';
import './markup.js';

// https://freemarker.apache.org/docs/dgui_template_exp.html

// FTL expression with 4 levels of nesting supported
var FTL_EXPR = /[^<()"']|\((?:<expr>)*\)|<(?!#--)|<#--(?:[^-]|-(?!->))*-->|"(?:[^\\"]|\\.)*"|'(?:[^\\']|\\.)*'/.source;
var exprReplace = /<expr>/g;
FTL_EXPR = FTL_EXPR.replace(exprReplace, FTL_EXPR).replace(exprReplace, FTL_EXPR).replace(exprReplace, /[^\s\S]/.source);

var interpolationInside = {
	'interpolation-punctuation': {
		pattern: /^\$\{|\}$/,
		alias: 'punctuation'
	}
};

var ftl = interpolationInside[rest] = {
	'comment': /<#--[\s\S]*?-->/,
	'string': [
		{
			// raw string
			pattern: /\br("|')(?:(?!\1)[^\\]|\\.)*\1/,
			greedy: true
		},
		{
			pattern: RegExp(/("|')(?:(?!\1|\$\{)[^\\]|\\.|\$\{(?:(?!\})(?:<expr>))*\})*\1/.source.replace(exprReplace, FTL_EXPR)),
			greedy: true,
			inside: {
				'interpolation': {
					pattern: RegExp(/((?:^|[^\\])(?:\\\\)*)\$\{(?:(?!\})(?:<expr>))*\}/.source.replace(exprReplace, FTL_EXPR)),
					lookbehind: true,
					inside: interpolationInside
				}
			}
		}
	],
	'keyword': /\b(?:as)\b/,
	'boolean': /\b(?:false|true)\b/,
	'builtin-function': {
		pattern: /((?:^|[^?])\?\s*)\w+/,
		lookbehind: true,
		alias: 'function'
	},
	'function': /\b\w+(?=\s*\()/,
	'number': /\b\d+(?:\.\d+)?\b/,
	'operator': /\.\.[<*!]?|->|--|\+\+|&&|\|\||\?{1,2}|[-+*/%!=<>]=?|\b(?:gt|gte|lt|lte)\b/,
	'punctuation': /[,;.:()[\]{}]/
};

languages.ftl = {
	'ftl-comment': {
		pattern: /<#--[\s\S]*?-->/,
		greedy: true,
		alias: 'comment'
	},
	'ftl-directive': {
		pattern: RegExp(/<\/?[#@][a-zA-Z](?:<expr>)*?>/.source.replace(exprReplace, FTL_EXPR), 'gi'),
		greedy: true,
		inside: {
			'punctuation': /^<\/?|\/?>$/,
			'directive': {
				pattern: /^[#@][a-z]\w*/i,
				alias: 'keyword'
			},
			'content': {
				pattern: /\s*\S[\s\S]*/,
				alias: 'ftl',
				inside: ftl
			}
		}
	},
	'ftl-interpolation': {
		pattern: RegExp(/\$\{(?:<expr>)*?\}/.source.replace(exprReplace, FTL_EXPR), 'gi'),
		greedy: true,
		inside: {
			'punctuation': /^\$\{|\}$/,
			'content': {
				pattern: /\s*\S[\s\S]*/,
				alias: 'ftl',
				inside: ftl
			}
		}
	},
	[tokenize]: embeddedIn('html')
};
