import { languages } from '../core.js';

languages.ignore = {
	// https://git-scm.com/docs/gitignore
	'comment': /^#.*/m,
	'entry': {
		pattern: /\S(?:.*(?:(?:\\ )|\S))?/,
		alias: 'string',
		inside: {
			'operator': /^!|\*\*?|\?/,
			'regex': {
				pattern: /(^|[^\\])\[[^\[\]]*\]/,
				lookbehind: true
			},
			'punctuation': /\//
		}
	}
};

languages.gitignore = languages.ignore;
languages.hgignore = languages.ignore;
languages.npmignore = languages.ignore;
