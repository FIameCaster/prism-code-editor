import { tokenize, withoutTokenizer } from '../core.js';
import { braces } from './jsx-shared.js';
import { re } from './shared.js';

/**
 * @param {string} tagName
 * @param {*} tagInside
 * @param {(code: string) => string} getLang
 */
var addInlined = (tagName, tagInside, getLang) => ({
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

/**
 * @param {*} expression
 */
var astroTag = expression => ({
	pattern: re(
		/<\/?(?:(?!\d)[^\s%=<>/]+(?:\s(?:\s*(?:[^\s{=<>/]+(?:\s*=\s*(?!\s)(?:"[^"]*"|'[^']*'|[^\s{=<>/"']+(?=[\s/>])|<0>)?|(?=[\s/>]))|<0>))*)?\s*\/?)?>/.source, [braces], 'g'
	),
	greedy: true,
	inside: {
		'punctuation': /^<\/?|\/?>$/,
		'tag': {
			pattern: /^\S+/,
			inside: {
				'namespace': /^[^:]+:/,
				'class-name': /^[A-Z]\w*(?:\.[A-Z]\w*)*$/
			}
		},
		'attr-value': {
			pattern: /(=\s*)(?:"[^"]*"|'[^']*'|[^\s>{]+)/,
			lookbehind: true,
			inside: {
				'punctuation': /^["']|["']$/
			}
		},
		'expression': expression,
		'attr-equals': /=/,
		'attr-name': {
			pattern: /\S+/,
			inside: {
				'namespace': /^[^:]+:/
			}
		}
	}
});

export { addInlined, astroTag };
