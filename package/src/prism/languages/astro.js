import { languages } from "../core.js";
import { braces, spread } from "../utils/jsx-shared.js";
import { addInlined } from "../utils/markup-shared.js";
import { re } from "../utils/shared.js";
import { xmlComment, entity } from "../utils/xml-shared.js";

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
	'script': addInlined('script', tagInside, code => {
		return /^[^>]+?[\s"'}]is:inline\b/.test(code) ? "javascript" : "typescript";
	}),
	'style': addInlined('style', tagInside, code => {
		var lang = /^[^>]+?[\s"'}]lang\s*=\s*["'](less|sass|s?css|stylus)["']/.exec(code)?.[1];
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
