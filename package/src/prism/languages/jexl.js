import { languages } from '../core.js';
import { boolean } from '../utils/shared.js';

languages.jexl = {
	'string': /(["'])(?:\\[\s\S]|(?!\1)[^\\])*\1/,
	'transform': {
		pattern: /(\|\s*)[a-zA-Zа-яА-Я_\xC0-\xD6\xD8-\xF6\xF8-\xFF$][\wа-яА-Я\xC0-\xD6\xD8-\xF6\xF8-\xFF$]*/,
		alias: 'function',
		lookbehind: true
	},
	'function': /[a-zA-Zа-яА-Я_\xC0-\xD6\xD8-\xF6\xF8-\xFF$][\wа-яА-Я\xC0-\xD6\xD8-\xF6\xF8-\xFF$]*\s*(?=\()/,
	'number': /\b\d+(?:\.\d+)?\b|\B\.\d+\b/,
	'operator': /[<>!]=?|-|\+|&&|==|\|\|?|\/\/?|[?:*^%]/,
	'boolean': boolean,
	'keyword': /\bin\b/,
	'punctuation': /[{}[\](),.]/,
};
