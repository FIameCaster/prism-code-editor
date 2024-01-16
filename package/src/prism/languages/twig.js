import { languages, tokenize } from '../core.js';
import { embeddedIn } from '../utils/templating.js';
import './markup.js';

languages.twig = {
	'twig-comment': {
		pattern: /\{#[\s\S]*?#\}/,
		greedy: true,
		alias: 'comment'
	},
	'twig': {
		pattern: /\{(?:#[\s\S]*?#|%[\s\S]*?%|\{[\s\S]*?\})\}/,
		greedy: true,
		inside: {
			'tag-name': {
				pattern: /(^\{%-?\s*)\w+/,
				lookbehind: true,
				alias: 'keyword'
			},
			'delimiter': {
				pattern: /^\{[{%]-?|-?[%}]\}$/,
				alias: 'punctuation'
			},
		
			'string': {
				pattern: /("|')(?:\\.|(?!\1)[^\\\n])*\1/,
				inside: {
					'punctuation': /^['"]|['"]$/
				}
			},
			'keyword': /\b(?:even|if|odd)\b/,
			'boolean': /\b(?:false|null|true)\b/,
			'number': /\b0x[\dA-Fa-f]+|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:[Ee][-+]?\d+)?/,
			'operator': [
				{
					pattern: /(\s)(?:and|b-and|b-or|b-xor|ends with|in|is|matches|not|or|same as|starts with)(?=\s)/,
					lookbehind: true
				},
				/[=<>]=?|!=|\*\*?|\/\/?|\?:?|[-+~%|]/
			],
			'punctuation': /[()\[\]{}:.,]/
		}
	},
	[tokenize]: embeddedIn('html')
};