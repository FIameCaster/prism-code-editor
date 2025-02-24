import { tokenize, withoutTokenizer } from "../core.js";

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

export { addInlined };
