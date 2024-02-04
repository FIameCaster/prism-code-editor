import { languages, rest } from '../core.js';
import { clone, insertBefore } from '../utils/language.js';
import { boolean } from '../utils/shared.js';
import './markup.js';

var vel = languages.velocity = clone(languages.html);

var variable = {
	pattern: /(^|[^\\](?:\\\\)*)\$!?(?:[a-z][\w-]*(?:\([^)]*\))?(?:\.[a-z][\w-]*(?:\([^)]*\))?|\[[^\]]+\])*|\{[^}]+\})/i,
	lookbehind: true
}

var velocity = {
	'variable': variable,
	'string': {
		pattern: /"[^"]*"|'[^']*'/g,
		greedy: true
	},
	'number': /\b\d+\b/,
	'boolean': boolean,
	'operator': /[=!<>]=?|[+*/%-]|&&|\|\||\.\.|\b(?:eq|g[et]|l[et]|n(?:e|ot))\b/,
	'punctuation': /[(){}[\]:,.]/
};

variable.inside = {
	'string': velocity['string'],
	'function': {
		pattern: /([^\w-])[a-z][\w-]*(?=\()/,
		lookbehind: true
	},
	'number': velocity['number'],
	'boolean': velocity['boolean'],
	'punctuation': velocity['punctuation']
};

insertBefore(vel, 'comment', {
	'unparsed': {
		pattern: /(^|[^\\])#\[\[[\s\S]*?\]\]#/g,
		lookbehind: true,
		greedy: true,
		inside: {
			'punctuation': /^#\[\[|\]\]#$/
		}
	},
	'velocity-comment': [
		{
			pattern: /(^|[^\\])#\*[\s\S]*?\*#/g,
			lookbehind: true,
			greedy: true,
			alias: 'comment'
		},
		{
			pattern: /(^|[^\\])##.*/g,
			lookbehind: true,
			greedy: true,
			alias: 'comment'
		}
	],
	'directive': {
		pattern: /(^|[^\\](?:\\\\)*)#@?(?:[a-z][\w-]*|\{[a-z][\w-]*\})(?:\s*\((?:[^()]|\([^()]*\))*\))?/i,
		lookbehind: true,
		inside: {
			'keyword': {
				pattern: /^#@?(?:[a-z][\w-]*|\{[a-z][\w-]*\})|\bin\b/,
				inside: {
					'punctuation': /[{}]/
				}
			},
			[rest]: velocity
		}
	},
	'variable': variable
});

vel['tag'].inside['attr-value'][2].inside[rest] = vel;
