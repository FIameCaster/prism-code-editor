import { languages, tokenize } from '../core.js';
import { embeddedIn } from '../utils/templating.js';
import './markup.js';
import './ruby.js';

languages.erb = {
	'erb': {
		pattern: /<%=?(?:[^\r\n]|[\r\n](?!=begin)|[\r\n]=begin\s(?:[^\r\n]|[\r\n](?!=end))*[\r\n]=end)+?%>/,
		inside: {
			'delimiter': {
				pattern: /^<%=?|%>$/,
				lookbehind: true,
				alias: 'punctuation'
			},
			'ruby': {
				pattern: /\s*\S[\s\S]*/,
				alias: 'language-ruby',
				inside: 'ruby'
			}
		}
	},
	[tokenize]: embeddedIn('html')
};
