import { languages } from '../core.js';
import { extend, insertBefore } from '../utils/language.js';
import './javascript.js';

var ts = languages.ts = languages.typescript = extend('js', {
	'class-name': {
		pattern: /(\b(?:class|extends|implements|instanceof|interface|new|type)\s+)(?!keyof\b)(?!\d)(?:(?!\s)[$\w\xA0-\uFFFF])+(?:\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>)?/,
		lookbehind: true,
		greedy: true
	}
});

insertBefore(ts, 'operator', {
	'builtin': /\b(?:Array|Function|Promise|any|boolean|never|number|string|symbol|unknown)\b/
});

// The keywords TypeScript adds to JavaScript
ts.keyword.push(
	/\b(?:abstract|declare|is|keyof|readonly|require)\b|\b(?:asserts|infer|interface|module|namespace|type)\b(?=\s*(?:[{_$a-zA-Z\xA0-\uFFFF]|$))|\btype\b(?=\s*(?:[\{*]|$))/
);

// doesn't work with TS because TS is too complex
delete ts['parameter'];
delete ts['literal-property'];

// a version of typescript specifically for highlighting types
var typeInside = Object.assign({}, ts);
delete typeInside['class-name'];
delete typeInside['maybe-class-name'];

ts['class-name'].inside = typeInside;

insertBefore(ts, 'function', {
	'decorator': {
		pattern: /@[$\w\xA0-\uFFFF]+/,
		inside: {
			'at': {
				pattern: /^@/,
				alias: 'operator'
			},
			'function': /.+/
		}
	},
	'generic-function': {
		// e.g. foo<T extends "bar" | "baz">( ...
		pattern: /#?(?!\d)(?:(?!\s)[$\w\xA0-\uFFFF])+\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>(?=\s*\()/,
		greedy: true,
		inside: {
			'function': /^#?(?!\d)(?:(?!\s)[$\w\xA0-\uFFFF])+/,
			'generic': {
				pattern: /<[\s\S]+/, // everything after the first <
				alias: 'class-name',
				inside: typeInside
			}
		}
	}
});
