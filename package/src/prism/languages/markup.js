import { languages } from '../core.js';
import { clone, insertBefore } from '../utils/language.js';

var entity = [
	{
		pattern: /&[\da-z]{1,8};/i,
		alias: 'named-entity'
	},
	/&#x?[\da-f]{1,8};/i
];

var specialAttr = [];

var addInlined = (tagName, lang) => ({
	pattern: RegExp(`(<${tagName}[^>]*>)(?:<!\\[CDATA\\[(?:[^\\]]|\\](?!\\]>))*\\]\\]>|(?!<!\\[CDATA\\[)[\\s\\S])*?(?=<\\/${tagName}>)`, 'i'),
	lookbehind: true,
	greedy: true,
	inside: {
		'included-cdata': {
			pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
			inside: {
				cdata: /^<!\[CDATA\[|\]\]>$/i,
				['language-' + lang]: {
					pattern: /[\s\S]+/,
					inside: lang
				}
			}
		},
		['language-' + lang]: {
			pattern: /[\s\S]+/,
			inside: lang
		}
	}
});

var addAttribute = (attrName, lang) => ({
	pattern: RegExp(`(^|["'\\s])(?:${attrName})\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s'">=]+)`, 'i'),
	lookbehind: true,
	inside: {
		'attr-name': /^[^\s=]+/,
		'attr-value': {
			pattern: /=[\s\S]+/,
			inside: {
				value: {
					pattern: /(^=\s*(["']|(?!["'])))\S[\s\S]*(?=\2$)/,
					lookbehind: true,
					alias: 'language-' + lang,
					inside: lang
				},
				'punctuation': [
					{
						pattern: /^=/,
						alias: 'attr-equals'
					},
					/"|'/
				]
			}
		}
	}
});

var markup = languages.svg = languages.mathml = languages.html = languages.markup = {
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
			'tag': {
				pattern: /^<\/?[^\s>\/]+/,
				inside: {
					'punctuation': /^<\/?/,
					'namespace': /^[^:]+:/
				}
			},
			'special-attr': specialAttr,
			'attr-value': {
				pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)?/,
				inside: {
					'punctuation': [
						{
							pattern: /^=/,
							alias: 'attr-equals'
						},
						{
							pattern: /^(\s*)["']|["']$/,
							lookbehind: true
						}
					],
					entity
				}
			},
			'punctuation': /\/?>/,
			'attr-name': {
				pattern: /[^\s/]+/,
				inside: {
					'namespace': /^[^:]+:/
				}
			}
		}
	},
	entity,
	'markup-bracket': {
		pattern: /[[\](){}]/,
		alias: 'punctuation'
	}
};

languages.rss = languages.atom = languages.ssml = languages.xml = clone(markup);

specialAttr.push(
	addAttribute('style', 'css'),
	addAttribute(/on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)/.source, 'javascript')
);

insertBefore(markup, 'cdata', {
	'style': addInlined('style', 'css'),
	'script': addInlined('script', 'javascript')
});
