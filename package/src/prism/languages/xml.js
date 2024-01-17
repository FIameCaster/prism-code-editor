import { languages } from '../core.js';

var entity = [
	{
		pattern: /&[\da-z]{1,8};/i,
		alias: 'named-entity'
	},
	/&#x?[\da-f]{1,8};/i
];

languages.rss = languages.atom = languages.ssml = languages.xml = {
	'comment': {
		pattern: /<!--(?:(?!<!--)[\s\S])*?-->/,
		greedy: true
	},
	'prolog': {
		pattern: /<\?[\s\S]+?\?>/,
		greedy: true
	},
	'doctype': {
		// https://www.w3.org/TR/xml/#NT-doctypedecl
		pattern: /<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,
		greedy: true,
		inside: {
			'internal-subset': {
				pattern: /(^[^\[]*\[)[\s\S]+(?=\]>$)/,
				lookbehind: true,
				greedy: true,
				inside: 'xml'
			},
			'string': {
				pattern: /"[^"]*"|'[^']*'/,
				greedy: true
			},
			'punctuation': /^<!|>$|[[\]]/,
			'doctype-tag': /^DOCTYPE/i,
			'name': /[^\s<>'"]+/
		}
	},
	'cdata': {
		pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
		greedy: true
	},
	'tag': {
		pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=\S))|(?=[\s/>])))+)?\s*\/?>/,
		greedy: true,
		inside: {
			'punctuation': /^<\/?|\/?>$/,
			'tag': {
				pattern: /^[^\s/]+/,
				inside: {
					'namespace': /^[^:]+:/
				}
			},
			'attr-value': [{
				pattern: /(=\s*)(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,
				lookbehind: true,
				inside: {
					'punctuation': /^["']|["']$/,
					entity
				}
			}],
			'attr-equals': /=/,
			'attr-name': {
				pattern: /\S+/,
				inside: {
					'namespace': /^[^:]+:/
				}
			}
		}
	},
	'entity': entity,
	'markup-bracket': {
		pattern: /[[\](){}]/,
		alias: 'punctuation'
	}
};
