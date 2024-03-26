import { languages } from '../core.js';

languages.properties = {
	'comment': /^[ \t]*[#!].*/m,
	'value': {
		pattern: /(^[ \t]*(?:\\[\s\S]|[^\\\s:=])+(?: *[=:] *(?! )| ))(?:\\[\s\S]|[^\\\n])+/m,
		lookbehind: true,
		alias: 'attr-value'
	},
	'key': {
		pattern: /^[ \t]*(?:\\[\s\S]|[^\\\s:=])+(?= *[=:]| )/m,
		alias: 'attr-name'
	},
	'punctuation': /[=:]/
};
