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
		pattern: /<!--(?:(?!<!--)[\s\S])*?-->/g,
		greedy: true
	},
	'prolog': {
		pattern: /<\?[\s\S]+?\?>/g,
		greedy: true
	},
	'doctype': {
		// https://www.w3.org/TR/xml/#NT-doctypedecl
		pattern: /<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/gi,
		greedy: true,
		inside: {
			'internal-subset': {
				pattern: /(\[)[\s\S]+(?=\]\s*>$)/,
				lookbehind: true,
				inside: 'xml'
			},
			'string': /"[^"]*"|'[^']*'/,
			'punctuation': /^<!|[>[\]]/,
			'doctype-tag': /^DOCTYPE/i,
			'name': /\S+/
		}
	},
	'cdata': {
		pattern: /<!\[CDATA\[[\s\S]*?\]\]>/gi,
		greedy: true
	},
	'tag': {
		pattern: /<\/?(?!\d)[^\s>/=$<%]+(?:\s(?:\s*[^\s>/=]+(?:\s*=\s*(?!\s)(?:"[^"]*"|'[^']*'|[^\s'"=>]+(?=[\s>]))?|(?=[\s/>])))+)?\s*\/?>/g,
		greedy: true,
		inside: {
			'punctuation': /^<\/?|\/?>$/,
			'tag': {
				pattern: /^\S+/,
				inside: {
					'namespace': /^[^:]+:/
				}
			},
			'attr-value': [{
				pattern: /(=\s*)(?:"[^"]*"|'[^']*'|[^\s'"=]+)/,
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
