import { languages, tokenize } from '../core.js';
import { embeddedIn } from '../utils/templating.js';
import './javascript.js';
import './markup.js';

languages.eta = languages.ejs = {
	'ejs-comment': {
		pattern: /<%#[\s\S]*?%>/g,
		greedy: true,
		alias: 'comment'
	},
	'escape': {
		pattern: /<%%|%%>/g,
		greedy: true
	},
	'ejs': {
		pattern: /<%[^%#][\s\S]*?%>/g,
		greedy: true,
		inside: {
			'delimiter': {
				pattern: /^<%[-_=]?|[-_]?%>$/,
				alias: 'punctuation'
			},
			'language-javascript': {
				pattern: /[\s\S]+/,
				inside: 'javascript'
			}
		}
	},
	[tokenize]: embeddedIn('markup')
};
