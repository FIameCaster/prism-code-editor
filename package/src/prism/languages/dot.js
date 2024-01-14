import { languages } from '../core.js';

var ID = `(?:(?!\d)[\\w\\x80-\\uFFFF]+|-?(?:\\.\\d+|\\d+(?:\\.\\d*)?)|"[^"\\\\]*(?:\\\\[\\s\\S][^"\\\\]*)*"|<(?:[^<>]|(?!<!--)<(?:[^<>"']|"[^"]*"|'[^']*')+>|<!--(?:[^-]|-(?!->))*-->)*>)`;

var IDInside = {
	'markup': {
		pattern: /(^<)[\s\S]+(?=>)/,
		lookbehind: true,
		alias: 'language-markup',
		inside: 'markup'
	}
};

/**
 * @param {string} source
 * @param {string} flags
 * @returns {RegExp}
 */
var withID = (source, flags) =>
	RegExp(source.replace(/<ID>/g, ID), flags);

languages.gv = languages.dot = {
	'comment': {
		pattern: /\/\/.*|\/\*[\s\S]*?\*\/|^#.*/m,
		greedy: true
	},
	'graph-name': {
		pattern: withID(/(\b(?:digraph|graph|subgraph)[ \t\r\n]+)<ID>/.source, 'i'),
		lookbehind: true,
		greedy: true,
		alias: 'class-name',
		inside: IDInside
	},
	'attr-value': {
		pattern: withID(/(=[ \t\r\n]*)<ID>/.source),
		lookbehind: true,
		greedy: true,
		inside: IDInside
	},
	'attr-name': {
		pattern: withID(/([\[;, \t\r\n])<ID>(?=[ \t\r\n]*=)/.source),
		lookbehind: true,
		greedy: true,
		inside: IDInside
	},
	'keyword': /\b(?:digraph|edge|graph|node|strict|subgraph)\b/i,
	'compass-point': {
		pattern: /(:[ \t\r\n]*)(?:[ewc_]|[ns][ew]?)(?![\w\x80-\uFFFF])/,
		lookbehind: true,
		alias: 'builtin'
	},
	'node': {
		pattern: withID(/(^|[^-.\w\x80-\uFFFF\\])<ID>/.source),
		lookbehind: true,
		greedy: true,
		inside: IDInside
	},
	'operator': /[=:]|-[->]/,
	'punctuation': /[\[\]{};,]/
};
