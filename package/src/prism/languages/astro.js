import { languages, tokenize, withoutTokenizer } from "../core.js";
import { braces, spread } from "../utils/jsx-shared.js";
import { re } from "../utils/shared.js";
import { xmlComment, entity } from "../utils/xml-shared.js";
import './tsx.js';

var tagInside = {
	'punctuation': /^<\/?|\/?>$/,
	'tag': {
		pattern: /^[^\s/]+/,
		inside: {
			'namespace': /^[^:]+:/,
			'class-name': /^[A-Z]\w*(?:\.[A-Z]\w*)*$/
		}
	},
	'script': {
		// Allow for two levels of nesting
		pattern: re(/(=\s*)<0>/.source, [braces]),
		lookbehind: true,
		alias: 'language-typescript',
		inside: 'ts'
	},
	'spread': {
		pattern: RegExp(spread),
		alias: 'language-typescript',
		inside: 'ts'
	},
	'attr-value': {
		pattern: /(=\s*)(?:"[^"]*"|'[^']*')/,
		lookbehind: true,
		inside: {
			'punctuation': /^["']|["']$/
		}
	},
	'attr-equals': /=/,
	'attr-name': {
		pattern: /\S+/,
		inside: {
			'namespace': /^[^:]+:/
		}
	}
};

var addInlined = (tagName, getLang) => ({
	pattern: RegExp(`<${tagName}(?:\\s[^>]*)?>[\\s\\S]*?</${tagName}\\s*>`, 'g'),
	greedy: true,
	inside: {
		'block': {
			pattern: /(>)[\s\S]+(?=<)/,
			lookbehind: true
		},
		'tag': {
			pattern: /[\s\S]+/,
			inside: tagInside
		},
		[tokenize]: (code, grammar) => {
			grammar['block'].alias = 'language-' + (grammar['block'].inside = getLang(code));
			return withoutTokenizer(code, grammar);
		}
	}
});

var astro = languages.astro = {
	'comment': xmlComment,
	'front-matter-block': {
		pattern: /^---(?!.)[\s\S]*?\n---/g,
		greedy: true,
		inside: {
			'punctuation': /^---|---$/,
			'language-typecript': {
				pattern: /[\s\S]+/,
				inside: 'ts'
			}
		}
	},
	'script': addInlined('script', code => {
		return /^<[^>]+?[\s"'}]is:inline\b/.test(code) ? "javascript" : "typescript";
	}),
	'style': addInlined('style', code => {
		var lang = /^<[^>]+?[\s"'}]lang\s*=\s*["']([^"']+)["']/.exec(code)?.[1];
		return lang && languages[lang] ? lang : "css";
	}),
	'expression': {
		pattern: RegExp(braces, 'g'),
		greedy: true,
		alias: 'language-tsx',
		inside: 'tsx'
	},
	'tag': {
		pattern: re(
			/<\/?(?:(?!\d)[^\s%=<>/]+(?:\s(?:\s*(?:[^\s{=<>/]+(?:\s*=\s*(?!\s)(?:"[^"]*"|'[^']*'|<0>)?|(?=[\s/>]))|<1>))*)?\s*\/?)?>/.source, [braces, spread], 'g'
		),
		greedy: true,
		inside: tagInside
	},
	'entity': entity
};
