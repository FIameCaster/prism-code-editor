import { languages } from '../core.js';

languages.rbnf = languages.bnf = {
	'string': /"[^\r\n"]*"|'[^\r\n']*'/,
	'definition': {
		pattern: /<[^<>\r\n\t]+>(?=\s*::=)/,
		alias: 'rule keyword',
		inside: {
			'punctuation': /^<|>$/
		}
	},
	'rule': {
		pattern: /<[^<>\r\n\t]+>/,
		inside: {
			'punctuation': /^<|>$/
		}
	},
	'operator': /::=|[|()[\]{}*+?]|\.{3}/
};
