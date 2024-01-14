import { languages, tokenize } from '../core.js';
import { embeddedIn } from '../utils/templating.js';
import './markup.js';

languages.jinja2 = languages.django = {
	'django': {
		pattern: /\{\{[\s\S]*?\}\}|\{%[\s\S]*?%\}|\{#[\s\S]*?#\}/,
		inside: {
			'comment': /^\{#[\s\S]*?#\}$/,
			'tag': {
				pattern: /(^\{%[+-]?\s*)\w+/,
				lookbehind: true,
				alias: 'keyword'
			},
			'delimiter': {
				pattern: /^\{[{%][+-]?|[+-]?[}%]\}$/,
				alias: 'punctuation'
			},
			'string': {
				pattern: /("|')(?:\\.|(?!\1)[^\\\n])*\1/,
				greedy: true
			},
			'filter': {
				pattern: /(\|)\w+/,
				lookbehind: true,
				alias: 'function'
			},
			'test': {
				pattern: /(\bis\s+(?:not\s+)?)(?!not\b)\w+/,
				lookbehind: true,
				alias: 'function'
			},
			'function': /\b[a-z_]\w+(?=\s*\()/i,
			'keyword': /\b(?:and|as|by|else|for|if|import|in|is|loop|not|or|recursive|with|without)\b/,
			'operator': /[-+%=]=?|!=|\*\*?=?|\/\/?=?|<[<=>]?|>[=>]?|[&|^~]/,
			'number': /\b\d+(?:\.\d+)?\b/,
			'boolean': /[Ff]alse|[Nn]one|[Tt]rue/,
			'variable': /\b\w+\b/,
			'punctuation': /[{}[\](),.:;]/
		}
	},
	[tokenize]: embeddedIn('html')
};
