import { languages } from '../core.js';

languages.javadoclike = {
	'parameter': {
		pattern: /(^[ \t]*(?:\/{3}|\*|\/\*\*)\s*@(?:arg|arguments|param)\s+)\w+/m,
		lookbehind: true
	},
	'keyword': {
		// keywords are the first word in a line preceded be an `@` or surrounded by curly braces.
		// @word, {@word}
		pattern: /(^[ \t]*(?:\/{3}|\*|\/\*\*)\s*|\{)@[a-z][a-zA-Z-]+\b/m,
		lookbehind: true
	},
	'punctuation': /[{}]/
};
