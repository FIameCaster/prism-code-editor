import { languages, tokenize } from '../core.js';
import { extend, insertBefore } from '../utils/language.js';
import { embeddedIn } from '../utils/templating.js';
import './clike.js';
import './markup.js';

var tt2 = extend('clike', {
	'comment': /#.*|\[%#[\s\S]*?%\]/,
	'keyword': /\b(?:BLOCK|CALL|CASE|CATCH|CLEAR|DEBUG|DEFAULT|ELSE|ELSIF|END|FILTER|FINAL|FOREACH|[GS]ET|IF|IN|INCLUDE|INSERT|LAST|MACRO|META|NEXT|PERL|PROCESS|RAWPERL|RETURN|STOP|SWITCH|TAGS|THROW|TRY|UNLESS|USE|WHILE|WRAPPER)\b/,
	'punctuation': /[()[\]{},]/
});

insertBefore(tt2, 'number', {
	'operator': /=[>=]?|!=?|<=?|>=?|&&|\|\|?|\b(?:and|not|or)\b/,
	'variable': /\b[a-z]\w*(?:\s*\.\s*(?:\d+|\$?[a-z]\w*))*\b/i
});

insertBefore(tt2, 'keyword', {
	'delimiter': {
		pattern: /^[[%]%-?|-?%\]$/,
		alias: 'punctuation'
	}
});

insertBefore(tt2, 'string', {
	'single-quoted-string': {
		pattern: /'[^\\']*(?:\\[\s\S][^\\']*)*'/g,
		greedy: true,
		alias: 'string'
	},
	'double-quoted-string': {
		pattern: /"[^\\"]*(?:\\[\s\S][^\\"]*)*"/g,
		greedy: true,
		alias: 'string',
		inside: {
			'variable': /\$(?:[a-z]\w*(?:\.(?:\d+|\$?[a-z]\w*))*)/i
		}
	}
});

// The different types of TT2 strings "replace" the C-like standard string
delete tt2.string;

languages.tt2 = {
	'tt2': {
		pattern: /\[%[\s\S]+?%\]/,
		inside: tt2
	},
	[tokenize]: embeddedIn('html')
};
