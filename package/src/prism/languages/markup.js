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
	pattern: RegExp(`(<${tagName}[^>]*>)(?!</${tagName}>)(?:<!\\[CDATA\\[(?:[^\\]]|\\](?!\\]>))*\\]\\]>|(?!<!\\[CDATA\\[)[\\s\\S])+?(?=</${tagName}>)`, 'gi'),
	lookbehind: true,
	greedy: true,
	inside: addLang({
		'included-cdata': {
			pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
			inside: addLang({
				'cdata': /^<!\[CDATA\[|\]\]>$/i
			}, lang)
		}
	}, lang)
});

var addAttribute = (attrName, lang) => ({
	pattern: RegExp(`((?:^|["'\\s])(?:${attrName})\\s*=\\s*)(?:"[^"]*"|'[^']*'|[^\\s"'=>]+)`, 'gi'),
	lookbehind: true,
	greedy: true,
	inside: addLang({
		'punctuation': /^["']|["']$/,
	}, lang)
});

var markup = languages.svg = languages.mathml = languages.html = languages.markup = clone(languages.xml);

markup.tag.inside['attr-value'].unshift(
	addAttribute('style', 'css'),
	addAttribute(/on[a-z]+/.source, 'javascript')
);

insertBefore(markup, 'cdata', {
	'style': addInlined('style', 'css'),
	'script': addInlined('script', 'javascript')
});
