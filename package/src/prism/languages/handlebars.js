import { languages, tokenize } from '../core.js';
import { boolean } from '../utils/shared.js';
import { embeddedIn } from '../utils/templating.js';
import './markup.js';

languages.mustache = languages.hbs = languages.handlebars = {
	'handlebars': {
		pattern: /\{\{\{[\s\S]+?\}\}\}|\{\{[\s\S]+?\}\}/,
		inside: {
			'comment': /\{\{![\s\S]*?\}\}/,
			'delimiter': {
				pattern: /^\{\{\{?|\}\}\}?$/,
				alias: 'punctuation'
			},
			'string': /(["'])(?:\\.|(?!\1)[^\\\n])*\1/,
			'number': /\b0x[\dA-Fa-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:[Ee][+-]?\d+)?/,
			'boolean': boolean,
			'block': {
				pattern: /^(\s*(?:~\s*)?)[#\/]\S+?(?=\s*(?:~\s*)?$|\s)/,
				lookbehind: true,
				alias: 'keyword'
			},
			'brackets': {
				pattern: /\[[^\]]+\]/,
				inside: {
					punctuation: /\[|\]/,
					variable: /[\s\S]+/
				}
			},
			'punctuation': /[!"#%&':()*+,.\/;<=>@\[\\\]^`{|}~]/,
			'variable': /[^!"#%&'()*+,\/;<=>@\[\\\]^`{|}~\s]+/
		}
	},
	[tokenize]: embeddedIn('html')
};
