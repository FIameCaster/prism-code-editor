import { languages } from '../core.js';

languages.keyman = {
	'comment': {
		pattern: /\bc .*/gi,
		greedy: true
	},
	'string': {
		pattern: /"[^"\n]*"|'[^'\n]*'/g,
		greedy: true
	},
	'virtual-key': {
		pattern: /\[\s*(?:(?:ALT|CAPS|CTRL|LALT|LCTRL|NCAPS|RALT|RCTRL|SHIFT)\s+)*(?:[TKU]_[\w?]+|[A-E]\d\d?|"[^"\n]*"|'[^'\n]*')\s*\]/gi,
		greedy: true,
		alias: 'function' // alias for styles
	},

	// https://help.keyman.com/developer/language/guide/headers
	'header-keyword': {
		pattern: /&\w+/,
		alias: 'bold' // alias for styles
	},
	'header-statement': {
		pattern: /\b(?:bitmap|bitmaps|caps always off|caps on only|copyright|hotkey|language|layout|message|name|shift frees caps|version)\b/i,
		alias: 'bold' // alias for styles
	},

	'rule-keyword': {
		pattern: /\b(?:any|baselayout|beep|call|context|deadkey|dk|if|index|layer|notany|nul|outs|platform|reset|return|save|set|store|use)\b/i,
		alias: 'keyword'
	},
	'structural-keyword': {
		pattern: /\b(?:ansi|begin|group|match|newcontext|nomatch|postkeystroke|readonly|unicode|using keys)\b/i,
		alias: 'keyword'
	},

	'compile-target': {
		pattern: /\$(?:keyman|keymanonly|keymanweb|kmfl|weaver):/i,
		alias: 'property'
	},

	// U+####, x###, d### characters and numbers
	'number': /\b(?:U\+[\dA-F]+|d\d+|x[\da-f]+|\d+)\b/i,
	'operator': /[+>\\$]|\.\./,
	'punctuation': /[()=,]/
};
