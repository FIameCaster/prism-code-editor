import { languages, tokenize } from '../core.js';
import { boolean, clikeString } from '../utils/shared.js';
import { embeddedIn } from '../utils/templating.js';
import './markup.js';

var numberPattern = /\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b|\b0x[A-F\d]+\b/;
var string = clikeString();

languages.soy = {
	'ignore-literal': {
		pattern: /(\{literal\})(?!\{\/literal\})[\s\S]+?(?=\{\/literal\})/g,
		lookbehind: true,
		greedy: true
	},
	'soy': {
		pattern: /\{\{.+?\}\}|\{.+?\}|\s\/\/.*|\/\*[\s\S]*?\*\//g,
		greedy: true,
		inside: {
			'comment': {
				pattern: /\/\*[\s\S]*?\*\/|(\s)\/\/.*/g,
				lookbehind: true,
				greedy: true
			},
			'command-arg': {
				pattern: /(\{+\/?\s*(?:alias|call|delcall|delpackage|deltemplate|namespace|template)\s+)\.?[\w.]+/,
				lookbehind: true,
				alias: 'string',
				inside: {
					'punctuation': /\./
				}
			},
			'parameter': {
				pattern: /(\{+\/?\s*@?param\??\s+)\.?[\w.]+/,
				lookbehind: true,
				alias: 'variable'
			},
			'keyword': {
				pattern: /(\{+\/?[^\S\n]*)(?:\\[nrt]|alias|call|case|css|default|delcall|delpackage|deltemplate|else(?:if)?|fallbackmsg|for(?:each)?|if(?:empty)?|lb|let|literal|msg|namespace|nil|@?param\??|rb|sp|switch|template|xid)|\b(?:any|as|attributes|bool|css|float|html|in|int|js|list|map|null|number|string|uri)\b/,
				lookbehind: true
			},
			'delimiter': {
				pattern: /^\{+\/?|\/?\}+$/,
				alias: 'punctuation'
			},
			'property': /\w+(?==)/,
			'variable': {
				pattern: /\$[^\W\d]\w*(?:\??(?:\.\w+|\[[^\]]+\]))*/,
				inside: {
					'string': string,
					'number': numberPattern,
					'punctuation': /[[\].?]/
				}
			},
			'string': string,
			'function': [
				/\w+(?=\()/,
				{
					pattern: /(\|[^\S\n]*)\w+/,
					lookbehind: true
				}
			],
			'boolean': boolean,
			'number': numberPattern,
			'operator': /\?:?|<=?|>=?|==?|!=|[+*/%-]|\b(?:and|not|or)\b/,
			'punctuation': /[()[\]{}.,:|]/
		}
	},
	[tokenize]: embeddedIn('html')
};
