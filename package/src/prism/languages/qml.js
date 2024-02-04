import { languages } from '../core.js';
import { clikeComment } from '../utils/shared.js';
import './javascript.js';

var jsExpr = /(?:[^\\()[\]{}"'/]|"(?:\\.|[^\\"\n])*"|'(?:\\.|[^\\'\n])*'|\/(?![*/])|\/\/.*(?!.)|\/\*(?:[^*]|\*(?!\/))*\*\/|\(<expr>*\)|\[<expr>*\]|\{<expr>*\}|\\[\s\S])/.source;

// the pattern will blow up, so only a few iterations
for (var i = 0; i < 2; i++) {
	jsExpr = jsExpr.replace(/<expr>/g, jsExpr);
}
jsExpr = jsExpr.replace(/<expr>/g, '[]');


languages.qml = {
	'comment': clikeComment(),
	'javascript-function': {
		pattern: RegExp(/((?:^|;)[ \t]*)function\s+(?!\d)(?:(?!\s)[$\w\xA0-\uFFFF])+\s*\(<js>*\)\s*\{<js>*\}/.source.replace(/<js>/g, jsExpr), 'mg'),
		lookbehind: true,
		greedy: true,
		alias: 'language-javascript',
		inside: languages.js
	},
	'class-name': {
		pattern: /((?:^|[:;])[ \t]*)(?!\d)\w+(?=[ \t]*\{|[ \t]+on\b)/m,
		lookbehind: true
	},
	'property': [
		{
			pattern: /((?:^|[;{])[ \t]*)(?!\d)\w+(?:\.\w+)*(?=[ \t]*:)/m,
			lookbehind: true
		},
		{
			pattern: /((?:^|[;{])[ \t]*)property[ \t]+(?!\d)\w+(?:\.\w+)*[ \t]+(?!\d)\w+(?:\.\w+)*(?=[ \t]*:)/m,
			lookbehind: true,
			inside: {
				'keyword': /^property/,
				'property': /\w+(?:\.\w+)*/
			}
		}
	],
	'javascript-expression': {
		pattern: RegExp(/(:[ \t]*)(?![\s;}[])(?:(?!$|[;}])<js>)+/.source.replace(/<js>/g, jsExpr), 'mg'),
		lookbehind: true,
		greedy: true,
		alias: 'language-javascript',
		inside: languages.js
	},
	'string': {
		pattern: /"(?:\\.|[^\\"\n])*"/g,
		greedy: true
	},
	'keyword': /\b(?:as|import|on)\b/,
	'punctuation': /[{}[\]:;,]/
};
