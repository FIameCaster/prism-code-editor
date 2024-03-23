import { languages, tokenize } from '../core.js';
import { extend, insertBefore } from '../utils/language.js';
import { embeddedIn } from '../utils/templating.js';
import './clike.js';
import './markup.js';

var tt2 = extend('clike', {
	'comment': /#.*|\[%#[\s\S]*?%\]/,
	'string': [
		{
			pattern: /'[^\\']*(?:\\[\s\S][^\\']*)*'/g,
			greedy: true,
		},
		{
			pattern: /"[^\\"]*(?:\\[\s\S][^\\"]*)*"/g,
			greedy: true,
			inside: {
				'variable': /\$(?:[a-z]\w*(?:\.(?:\d+|\$?[a-z]\w*))*)/i
			}
		}
	],
	'keyword': /\b(?:BLOCK|CALL|CASE|CATCH|CLEAR|DEBUG|DEFAULT|ELSE|ELSIF|END|FILTER|FINAL|FOREACH|[GS]ET|IF|IN|INCLUDE|INSERT|LAST|MACRO|META|NEXT|PERL|PROCESS|RAWPERL|RETURN|STOP|SWITCH|TAGS|THROW|TRY|UNLESS|USE|WHILE|WRAPPER)\b/,
	'punctuation': /[()[\]{},]/
});

insertBefore(tt2, 'number', {
	'operator': /=>|[!=<>]=?|&&|\|\|?|\b(?:and|not|or)\b/,
	'variable': /\b[a-z]\w*(?:\s*\.\s*(?:\d+|\$?[a-z]\w*))*\b/i
});

insertBefore(tt2, 'keyword', {
	'delimiter': {
		pattern: /^[[%]%-?|-?%\]$/,
		alias: 'punctuation'
	}
});

languages.tt2 = {
	'tt2': {
		pattern: /\[%[\s\S]+?%\]/,
		alias: 'language-tt2',
		inside: tt2
	},
	[tokenize]: embeddedIn('html')
};
