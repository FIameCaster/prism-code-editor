import { languages } from '../core.js';
import { braces } from '../utils/jsx-shared.js';
import { addInlined, astroTag } from '../utils/markup-shared.js';
import { re } from '../utils/shared.js';
import { xmlComment, entity } from '../utils/xml-shared.js';

var expression = {
	pattern: RegExp(braces, 'g'),
	greedy: true,
	alias: 'language-tsx',
	inside: 'tsx'
};

var tag = astroTag(expression);

var tagInside = tag.inside;

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
		return /^[^>]+?[\s"'}]is:inline\b/.test(code) ? 'javascript' : 'typescript';
	}),
	'style': addInlined('style', tagInside, code => {
		var lang = /^[^>]+?[\s"'}]lang\s*=\s*["'](less|sass|s?css|stylus)["']/.exec(code)?.[1];
		return lang && languages[lang] ? lang : 'css';
	}),
	'expression': expression,
	'tag': tag,
	'entity': entity
};
