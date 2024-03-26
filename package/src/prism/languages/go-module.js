import { languages } from '../core.js';

// https://go.dev/ref/mod#go-mod-file-module

languages['go-mod'] = languages['go-module'] = {
	'comment': /\/\/.*/,
	'version': {
		pattern: /(^|[\s()[\],])v\d+\.\d+\.\d+(?:[+-][\w.+-]*)?(?![^\s()[\],])/,
		lookbehind: true,
		alias: 'number'
	},
	'go-version': {
		pattern: /((?:^|\s)go\s+)\d+(?:\.\d+){1,2}/,
		lookbehind: true,
		alias: 'number'
	},
	'keyword': {
		pattern: /^([ \t]*)(?:exclude|go|module|replace|require|retract)\b/m,
		lookbehind: true
	},
	'operator': /=>/,
	'punctuation': /[()[\],]/
};
