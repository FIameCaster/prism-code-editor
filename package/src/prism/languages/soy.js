import { languages, tokenize } from '../core.js';
import { boolean, clikeString } from '../utils/patterns.js';
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
		pattern: /\{\{.+?\}\}|\{.+?\}|(^|\s)\/\/.*|\/\*[\s\S]*?\*\//g,
		lookbehind: true,
		greedy: true,
		alias: 'language-soy',
		inside: {
			'comment': {
				pattern: /(^|\s)\/\/.*|\/\*[\s\S]*?\*\//,
				lookbehind: true
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
				pattern: /(\{+\/?[^\S\n]*)(?:\\[nrt]|alias|call|case|css|default|delcall|delpackage|deltemplate|elseif|else|fallbackmsg|foreach|for|ifempty|if|lb|let|literal|msg|namespace|nil|@?param\??|rb|sp|switch|template|xid)|\b(?:any|as|attributes|bool|css|float|html|int?|js|list|map|null|number|string|uri)\b/,
				lookbehind: true
			},
			'delimiter': {
				pattern: /^\{+\/?|\/?\}+$/,
				alias: 'punctuation'
			},
			'property': /\w+(?==)/,
			'variable': {
				pattern: /\$(?!\d)\w+(?:\??(?:\.\w+|\[[^\]]+\]))*/,
				inside: {
					'string': string,
					'number': numberPattern,
					'punctuation': /[[\].?]/
				}
			},
			'string': string,
			'function': {
				pattern: /\w+(?=\()|(\|[^\S\n]*)\w+/,
				lookbehind: true
			},
			'boolean': boolean,
			'number': numberPattern,
			'operator': /\?:?|[=<>]=?|!=|[%/*+-]|\b(?:and|not|or)\b/,
			'punctuation': /[()[\]{}.,:|]/
		}
	},
	[tokenize]: embeddedIn('html')
};
