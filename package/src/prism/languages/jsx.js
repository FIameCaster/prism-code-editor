import { languages, Token, tokenize, withoutTokenizer } from '../core.js';
import { clone, insertBefore } from '../utils/language.js';
import './javascript.js';

var jsx = languages.jsx = clone(languages.js);

/**
 * @param {string} pattern
 */
var re = (pattern, flags) => RegExp(pattern
	.replace(/<S>/g, space)
	.replace(/<BRACES>/g, braces)
	.replace(/<SPREAD>/g, spread),
	flags
);

var space = /(?:\s|\/\/.*(?!.)|\/\*(?:[^*]|\*(?!\/))*\*\/)/.source;
var braces = /\{(?:\{(?:\{[^{}]*\}|[^{}])*\}|[^{}])*\}/.source;
var spread = re(/\{<S>*\.{3}(?:[^{}]|<BRACES>)*\}/.source).source;

var isText = token => token && (!token.type || token.type == 'plain-text');

/**
 * @param {(string | Token)[]} tokens
 * @param {string} code
 * @param {number} position
 */
var walkTokens = (tokens, code, position) => {
	for (var i = 0, openedTags = [], l = 0; i < tokens.length; i++) {
		var token = tokens[i];
		var length = token.length;
		var content = token.content;
		var type = token.type;
		var notTagNorBrace = !type;
		var last, tag, start, plainText;

		if (type) {
			if (type == 'tag' && code[position] == '<') {
				// We found a tag, now find its kind
				tag = content[2] ? code.substr(position + content[0].length, content[1].length) : '';
				if (code[position + 1] == '/') {
					// Closing tag
					if (l && openedTags[l - 1][0] == tag) {
						// Pop matching opening tag
						l--;
					}
				} else {
					if (code[position + length - 2] != '/') {
						// Opening tag
						openedTags[l++] = [tag, 0];
					}
				}
			} else if (l && type == 'punctuation') {
				last = openedTags[l - 1];
				if (content == '{') last[1]++;
				else if (last[1] && content == '}') last[1]--;
				else {
					notTagNorBrace = true;
				}
			} else {
				notTagNorBrace = true;
			}
		}
		if (notTagNorBrace && l && !openedTags[l - 1][1]) {
			// Here we are inside a tag, and not inside a JSX context.
			// That's plain text: drop any tokens matched.
			start = position;

			// And merge text with adjacent text
			if (isText(tokens[i + 1])) {
				length += tokens[i + 1].length;
				tokens.splice(i + 1, 1);
			}
			if (isText(tokens[i - 1])) {
				start -= tokens[--i].length;
				tokens.splice(i, 1);
			}

			plainText = code.slice(start, position + length);
			tokens[i] = new Token('plain-text', plainText, plainText, null);
		}
		else if (Array.isArray(content)) {
			walkTokens(content, code, position);
		}
		position += length;
	}
	return tokens;
};

insertBefore(jsx, 'regex', {
	'tag': {
		pattern: re(
			/<\/?(?:(?!\d)[^\s>/=<%]+(?:<S>+(?:[^\s{*<>/=]+(?:<S>*=<S>*(?!\s)(?:"[^"]*"|'[^']*'|[^\s{'"/>=]+|<BRACES>)?)?|<SPREAD>))*<S>*\/?)?>/.source, 'g'
		),
		greedy: true,
		inside: {
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
				pattern: re(/(=<S>*)<BRACES>/.source),
				lookbehind: true,
				alias: 'language-jsx',
				inside: jsx
			},
			'spread': {
				pattern: RegExp(spread),
				inside: jsx
			},
			'attr-value': {
				pattern: re(/(=<S>*)(?:"[^"]*"|'[^']*'|[^\s/]+)/.source),
				lookbehind: true,
				inside: {
					'punctuation': /^["']|["']$/
				}
			},
			'comment': jsx['comment'],
			'attr-equals': /=/,
			'attr-name': {
				pattern: /\S+/,
				inside: {
					'namespace': /^[^:]+:/
				}
			}
		}
	}
});

jsx[tokenize] = (code, grammar) => walkTokens(withoutTokenizer(code, grammar), code, 0);
