import { languages } from '../core.js';
import { clone, insertBefore } from '../utils/language.js';
import './xml.js';

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

var markup = languages.svg = languages.mathml = languages.html = languages.markup = clone(languages.xml);

insertBefore(markup.tag.inside, 'attr-value', {
	'special-attr': [
		addAttribute('style', 'css'),
		addAttribute(/on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)/.source, 'javascript')
	]
});

insertBefore(markup, 'cdata', {
	'style': addInlined('style', 'css'),
	'script': addInlined('script', 'javascript')
});
