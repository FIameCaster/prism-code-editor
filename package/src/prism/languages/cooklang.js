import { languages } from '../core.js';

// see https://github.com/cooklang/spec/blob/main/EBNF.md

var single_token_suffix = /(?:(?!\s)[\d$+<=a-zA-Z\x80-\uffff])+/.source;
var multi_token_infix = /[^{}@#]+/.source;
var multi_token = multi_token_infix + /\{[^}#@]*\}/.source;

var amount_group_impl = {
	pattern: /\{[^{}]*\}/,
	inside: {
		'amount': {
			pattern: /([\{|])[^{}|*%]+/,
			lookbehind: true,
			alias: 'number',
		},
		'unit': {
			pattern: /(%)[^}]+/,
			lookbehind: true,
			alias: 'symbol',
		},
		'servings-scaler': {
			pattern: /\*/,
			alias: 'operator',
		},
		'servings-alternative-separator': {
			pattern: /\|/,
			alias: 'operator',
		},
		'unit-separator': {
			pattern: /(?:%|(\*)%)/,
			lookbehind: true,
			alias: 'operator',
		},
		'punctuation': /[{}]/,
	}
};


languages.cooklang = {
	// [- comment -]
	// -- comment
	'comment': /\[-[\s\S]*?-\]|--.*/,
	'meta': { // >> key: value
		pattern: />>.*:.*/,
		inside: {
			'property': { // key:
				pattern: /(>>\s*)[^\s:](?:[^:]*[^\s:])?/,
				lookbehind: true,
			}
		}
	},
	'cookware-group': { // #...{...}, #...
		pattern: RegExp(`#(?:${multi_token}|${single_token_suffix})`),
		inside: {
			'cookware': {
				pattern: RegExp(`(^#)(?:${multi_token_infix})`),
				lookbehind: true,
				alias: 'variable',
			},
			'cookware-keyword': {
				pattern: /^#/,
				alias: 'keyword',
			},
			'quantity-group': {
				pattern: /\{[^{}@#]*\}/,
				inside: {
					'punctuation': /[{}]/,
					'quantity': {
						pattern: /[\s\S]+/,
						alias: 'number',
					},
				}
			}
		},
	},
	'ingredient-group': { // @...{...}, @...
		pattern: RegExp(`@(?:${multi_token}|${single_token_suffix})`),
		inside: {
			'ingredient': {
				pattern: RegExp(`(^@)(?:${multi_token_infix})`),
				lookbehind: true,
				alias: 'variable',
			},
			'ingredient-keyword': {
				pattern: /^@/,
				alias: 'keyword',
			},
			'amount-group': amount_group_impl,
		}
	},
	'timer-group': { // ~timer{...}
		// eslint-disable-next-line regexp/sort-alternatives
		pattern: /~(?!\s)[^@#~{}]*\{[^{}]*\}/,
		inside: {
			'timer': {
				pattern: /(^~)[^{]+/,
				lookbehind: true,
				alias: 'variable',
			},
			'duration-group': { // {...}
				pattern: /\{[^{}]*\}/,
				inside: {
					'punctuation': /[{}]/,
					'unit': {
						pattern: /(%\s*)(?:h|hours|hrs|m|min|minutes)\b/,
						lookbehind: true,
						alias: 'symbol',
					},
					'operator': /%/,
					'duration': {
						pattern: /\d+/,
						alias: 'number',
					},
				}
			},
			'timer-keyword': {
				pattern: /^~/,
				alias: 'keyword',
			},
		}
	}
};
