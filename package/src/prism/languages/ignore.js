import { languages } from '../core.js';

languages.npmignore = languages.hgignore = languages.gitignore = languages.ignore = {
	// https://git-scm.com/docs/gitignore
	'comment': /^#.*/m,
	'entry': {
		pattern: /\S(?:.*(?:(?:\\ )|\S))?/,
		alias: 'string',
		inside: {
			'operator': /^!|\*\*?|\?/,
			'regex': {
				pattern: /(^|[^\\])\[[^[\]]*\]/,
				lookbehind: true
			},
			'punctuation': /\//
		}
	}
};
