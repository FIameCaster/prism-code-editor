import { languages } from '../core.js';

languages.rbnf = languages.bnf = {
	'string': /"[^\n"]*"|'[^\n']*'/,
	'definition': {
		pattern: /<[^<>\n\t]+>(?=\s*::=)/,
		alias: 'rule keyword',
		inside: {
			'punctuation': /^<|>$/
		}
	},
	'rule': {
		pattern: /<[^<>\n\t]+>/,
		inside: {
			'punctuation': /^<|>$/
		}
	},
	'operator': /::=|[|()[\]{}*+?]|\.{3}/
};
