import { languages } from '../core.js';
import { extend } from '../utils/language.js';
import './markup.js';

/**
 * @param {string} source
 * @param {string} [flags]
 */
var withModifier = (source, flags = '') => RegExp(
	source
		.replace(/<MOD>/g, '(?:\\([^|()\n]+\\)|\\[[^\\]\n]+\\]|\\{[^}\n]+\\})')
		.replace(/<PAR>/g, '(?:\\)|\\((?![^|()\n]+\\)))'),
	flags
);

var modifierTokens = {
	'css': {
		pattern: /\{[^{}]+\}/,
		inside: 'css'
	},
	'class-id': {
		pattern: /(\()[^()]+(?=\))/,
		lookbehind: true,
		alias: 'attr-value'
	},
	'lang': {
		pattern: /(\[)[^\[\]]+(?=\])/,
		lookbehind: true,
		alias: 'attr-value'
	},
	// Anything else is punctuation (the first pattern is for row/col spans inside tables)
	'punctuation': /[\\\/]\d+|\S/
};


var textile = languages.textile = extend('markup', {
	'phrase': {
		pattern: /^\S[\s\S]*?(?:(?![\s\S])|(?=\n\n))/m,
		inside: {

			// h1. Header 1
			'block-tag': {
				pattern: withModifier('^[a-z]\\w*(?:<MOD>|<PAR>|[<>=])*\\.'),
				inside: {
					'modifier': {
						pattern: withModifier('(^[a-z]\\w*)(?:<MOD>|<PAR>|[<>=])+(?=\\.)'),
						lookbehind: true,
						inside: modifierTokens
					},
					'tag': /^[a-z]\w*/,
					'punctuation': /\.$/
				}
			},

			// # List item
			// * List item
			'list': {
				pattern: withModifier('^[*#]+<MOD>*\\s+\\S.*', 'm'),
				inside: {
					'modifier': {
						pattern: withModifier('(^[*#]+)<MOD>+'),
						lookbehind: true,
						inside: modifierTokens
					},
					'punctuation': /^[*#]+/
				}
			},

			// | cell | cell | cell |
			'table': {
				// Modifiers can be applied to the row: {color:red}.|1|2|3|
				// or the cell: |{color:red}.1|2|3|
				pattern: withModifier(/^(?:(?:<MOD>|<PAR>|[<>=^~])+\.\s*)?(?:\|(?:(?:<MOD>|<PAR>|[<>=^~_]|[\\/]\d+)+\.|(?!(?:<MOD>|<PAR>|[<>=^~_]|[\\/]\d+)+\.))[^|]*)+\|/.source, 'm'),
				inside: {
					'modifier': {
						// Modifiers for rows after the first one are
						// preceded by a pipe and a line feed
						pattern: withModifier(/(^|\|\n?)(?:<MOD>|<PAR>|[<>=^~_]|[\\/]\d+)+(?=\.)/.source),
						lookbehind: true,
						inside: modifierTokens
					},
					'punctuation': /\||^\./
				}
			},

			'inline': {
				// eslint-disable-next-line regexp/no-super-linear-backtracking
				pattern: withModifier(/(^|[^a-zA-Z\d])(\*\*|__|\?\?|[*_%@+\-^~])<MOD>*.+?\2(?![a-zA-Z\d])/.source),
				lookbehind: true,
				inside: {
					// Note: superscripts and subscripts are not handled specifically

					// *bold*, **bold**
					'bold': {
						// eslint-disable-next-line regexp/no-super-linear-backtracking
						pattern: withModifier(/(^(\*\*?)<MOD>*).+?(?=\2)/.source),
						lookbehind: true
					},

					// _italic_, __italic__
					'italic': {
						// eslint-disable-next-line regexp/no-super-linear-backtracking
						pattern: withModifier(/(^(__?)<MOD>*).+?(?=\2)/.source),
						lookbehind: true
					},

					// ??cite??
					'cite': {
						// eslint-disable-next-line regexp/no-super-linear-backtracking
						pattern: withModifier(/(^\?\?<MOD>*).+?(?=\?\?)/.source),
						lookbehind: true,
						alias: 'string'
					},

					// @code@
					'code': {
						// eslint-disable-next-line regexp/no-super-linear-backtracking
						pattern: withModifier('(^@<MOD>*).+?(?=@)'),
						lookbehind: true,
						alias: 'keyword'
					},

					// +inserted+
					'inserted': {
						// eslint-disable-next-line regexp/no-super-linear-backtracking
						pattern: withModifier('(^\\+<MOD>*).+?(?=\\+)'),
						lookbehind: true
					},

					// -deleted-
					'deleted': {
						// eslint-disable-next-line regexp/no-super-linear-backtracking
						pattern: withModifier('(^-<MOD>*).+?(?=-)'),
						lookbehind: true
					},

					// %span%
					'span': {
						// eslint-disable-next-line regexp/no-super-linear-backtracking
						pattern: withModifier('(^%<MOD>*).+?(?=%)'),
						lookbehind: true
					},

					'modifier': {
						pattern: withModifier('(^\\*\\*|__|\\?\\?|[*_%@+\\-^~])<MOD>+'),
						lookbehind: true,
						inside: modifierTokens
					},
					'punctuation': /[*_%?@+\-^~]+/
				}
			},

			// [alias]http://example.com
			'link-ref': {
				pattern: /^\[[^\]]+\]\S+$/m,
				inside: {
					'string': {
						pattern: /(^\[)[^\]]+(?=\])/,
						lookbehind: true
					},
					'url': {
						pattern: /(^\])\S+$/,
						lookbehind: true
					},
					'punctuation': /[\[\]]/
				}
			},

			// "text":http://example.com
			// "text":link-ref
			'link': {
				// eslint-disable-next-line regexp/no-super-linear-backtracking
				pattern: withModifier(/"<MOD>*[^"]+":.+?(?=[^\w/]?(?:\s|$))/.source),
				inside: {
					'text': {
						// eslint-disable-next-line regexp/no-super-linear-backtracking
						pattern: withModifier(/(^"<MOD>*)[^"]+(?=")/.source),
						lookbehind: true
					},
					'modifier': {
						pattern: withModifier(/(^")<MOD>+/.source),
						lookbehind: true,
						inside: modifierTokens
					},
					'url': {
						pattern: /(:).+/,
						lookbehind: true
					},
					'punctuation': /[":]/
				}
			},

			// !image.jpg!
			// !image.jpg(Title)!:http://example.com
			'image': {
				pattern: withModifier(/!(?:<MOD>|<PAR>|[<>=])*(?![<>=])[^!\s()]+(?:\([^)]+\))?!(?::.+?(?=[^\w/]?(?:\s|$)))?/.source),
				inside: {
					'source': {
						pattern: withModifier(/(^!(?:<MOD>|<PAR>|[<>=])*)(?![<>=])[^!\s()]+(?:\([^)]+\))?(?=!)/.source),
						lookbehind: true,
						alias: 'url'
					},
					'modifier': {
						pattern: withModifier(/(^!)(?:<MOD>|<PAR>|[<>=])+/.source),
						lookbehind: true,
						inside: modifierTokens
					},
					'url': {
						pattern: /(:).+/,
						lookbehind: true
					},
					'punctuation': /[!:]/
				}
			},

			// Footnote[1]
			'footnote': {
				pattern: /\b\[\d+\]/,
				alias: 'comment',
				inside: {
					'punctuation': /\[|\]/
				}
			},

			// CSS(Cascading Style Sheet)
			'acronym': {
				pattern: /\b[A-Z\d]+\([^)]+\)/,
				inside: {
					'comment': {
						pattern: /(\()[^()]+(?=\))/,
						lookbehind: true
					},
					'punctuation': /[()]/
				}
			},

			// Prism(C)
			'mark': {
				pattern: /\b\((?:C|R|TM)\)/,
				alias: 'comment',
				inside: {
					'punctuation': /[()]/
				}
			}
		}
	}
});

var phraseInside = textile['phrase'].inside;
var nestedPatterns = {
	'inline': phraseInside['inline'],
	'link': phraseInside['link'],
	'image': phraseInside['image'],
	'footnote': phraseInside['footnote'],
	'acronym': phraseInside['acronym'],
	'mark': phraseInside['mark']
};

// Only allow alpha-numeric HTML tags, not XML tags
textile.tag.pattern = /<\/?(?!\d)[a-z0-9]+(?:\s+[^\s>\/=]+(?:=(?:("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|[^\s'">=]+))?)*\s*\/?>/i;

// Allow some nesting
var phraseInlineInside = phraseInside['inline'].inside;
var phraseTableInside = phraseInside['table'].inside;
var brackets = textile['markup-bracket'];
delete textile['markup-bracket'];
textile['markup-bracket'] = brackets;

['bold', 'italic', 'inserted', 'deleted', 'span'].forEach(p => phraseInlineInside[p].inside = nestedPatterns);

// Allow some styles inside table cells
['inline', 'link', 'image', 'footnote', 'acronym', 'mark'].forEach(p => phraseTableInside[p] = nestedPatterns[p]);
