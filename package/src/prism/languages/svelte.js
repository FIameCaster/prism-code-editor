import { languages, tokenize, withoutTokenizer } from '../core.js';
import { braces } from '../utils/jsx-shared.js';
import { addInlined, astroTag } from '../utils/markup-shared.js';
import { re } from '../utils/shared.js';
import { entity, xmlComment } from '../utils/xml-shared.js';

var currentLang;

var expression = {
	pattern: RegExp(braces, 'g'),
	greedy: true
};

var tag = astroTag(expression);

var tagInside = tag.inside;

var blockInside = {
	'punctuation': /^[{#@:/]|\}$/,
	'keyword': /^else\s+if|^\w+/
};

var blockLang = {
	pattern: /[\s\S]+/
};

tagInside['attr-value'].inside['expression'] = expression;

languages.svelte = {
	'comment': xmlComment,
	'script': addInlined('script', tagInside, code => {
		return /^[^>]+?[\s"'}]lang\s*=\s*(["'])ts\1/.test(code) && languages.ts ? 'ts' : 'js';
	}),
	'style': addInlined('style', tagInside, code => {
		var lang = /^[^>]+?[\s"'}]lang\s*=\s*["'](less|sass|s?css|stylus)["']/.exec(code)?.[1];
		return lang && languages[lang] ? lang : 'css';
	}),
	'block': {
		pattern: re(/\{[#@:/]\w+(?:\s(?:[^{}]|<0>)*)?\}/.source, [braces], 'g'),
		greedy: true,
		inside: blockInside
	},
	'tag': tag,
	'expression': expression,
	'entity': entity,
	[tokenize](code, grammar) {
		var lang = /<script\s(?:[^>]*?[\s"'}])?lang\s*=\s*(["'])ts\1/.test(code) ? 'ts' : 'js';

		if (lang != currentLang) {
			expression.alias = 'language-' + lang;

			delete blockInside['language-' + currentLang];
			blockInside['language-' + lang] = blockLang;

			expression.inside = blockLang.inside = currentLang = lang;
		}

		return withoutTokenizer(code, grammar);
	}
};
