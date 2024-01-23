import { languages } from '../core.js';
import { clone, insertBefore } from '../utils/language.js';
import './xml.js';

var addLang = (grammar, lang) => {
	grammar['language-' + lang] = {
		pattern: /[\s\S]+/,
		inside: lang
	};
	return grammar;
};

var addInlined = (tagName, lang) => ({
	pattern: RegExp(`(<${tagName}[^>]*>)(?:<!\\[CDATA\\[(?:[^\\]]|\\](?!\\]>))*\\]\\]>|(?!<!\\[CDATA\\[)[\\s\\S])+?(?=<\\/${tagName}>)`, 'i'),
	lookbehind: true,
	greedy: true,
	inside: addLang({
		'included-cdata': {
			pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
			inside: addLang({
				cdata: /^<!\[CDATA\[|\]\]>$/i
			}, lang)
		}
	}, lang)
});

var addAttribute = (attrName, lang) => ({
	pattern: RegExp(`((?:^|["'\\s])(?:${attrName})\\s*=\\s*)(?:"[^"]*"|'[^']*'|[^\\s'">=]+)`, 'i'),
	lookbehind: true,
	inside: addLang({
		'punctuation': /^["']|["']$/,
	}, lang)
});

var markup = languages.svg = languages.mathml = languages.html = languages.markup = clone(languages.xml);

markup.tag.inside['attr-value'].unshift(
	addAttribute('style', 'css'),
	addAttribute(/on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)/.source, 'javascript')
);

insertBefore(markup, 'cdata', {
	'style': addInlined('style', 'css'),
	'script': addInlined('script', 'javascript')
});
