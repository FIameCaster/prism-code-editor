import { languages, Token, rest, tokenize, withoutTokenizer } from '../core.js';
import { clone, extend, insertBefore } from '../utils/language.js';
import './markup.js';
import './javascript.js';

var javascript = clone(languages.js);
var jsx = languages.jsx = extend('xml', javascript);
var tag = jsx.tag;
var tagInside = tag.inside;

var space = /(?:\s|\/\/.*(?!.)|\/\*(?:[^*]|\*(?!\/))*\*\/)/.source;
var braces = /(?:\{(?:\{(?:\{[^{}]*\}|[^{}])*\}|[^{}])*\})/.source;
var spread = /(?:\{<S>*\.{3}(?:[^{}]|<BRACES>)*\})/.source;

/**
 * @param {string} pattern
 */
var re = pattern => RegExp(pattern
	.replace(/<S>/g, space)
	.replace(/<BRACES>/g, braces)
	.replace(/<SPREAD>/g, spread)
);

spread = re(spread).source;

tag.pattern = re(
	/<\/?(?:(?!\d)[^\s>\/=<%]+(?:<S>+(?:[^\s{*<>\/=]+(?:<S>*=\s*(?:(?:"[^"]*"|'[^']*'|[^\s{'"\/>=]+|<BRACES>)|(?=\S)))?|<SPREAD>))*<S>*\/?)?>/.source
);

tagInside['tag'].pattern = /^<\/?[^\s>/]*/;
tagInside['attr-value'].pattern = /=\s*(?:"[^"]*"|'[^']*'|[^\s\/'">]+)?/;
tagInside['tag'].inside['class-name'] = /^[A-Z]\w*(?:\.[A-Z]\w*)*$/;
tagInside['comment'] = javascript['comment'];

delete jsx['markup-bracket'];

insertBefore(tagInside, 'special-attr', {
	'script': {
		// Allow for two levels of nesting
		pattern: re(/=\s*<BRACES>/.source),
		alias: 'language-jsx',
		inside: {
			'script-punctuation': {
				pattern: /^=/,
				alias: 'punctuation'
			},
			[rest]: jsx
		},
	},
	'spread': {
		pattern: RegExp(spread),
		inside: jsx
	}
});

var isText = token => token && (!token.type || token.type == 'plain-text');

var walkTokens = (tokens, code, position) => {
	for (var i = 0, openedTags = []; i < tokens.length; i++) {
		var token = tokens[i];
		var length = token.length;
		var content = token.content;
		var type = token.type;
		var notTagNorBrace = !type;
		var last, tag, start, plainText;

		if (type) {
			if (type == 'tag' && content[0].type == 'tag') {
				// We found a tag, now find its kind
				tag = code.slice(position + 1, position + content[0].length);
				if (tag[0] == '/') {
					// Closing tag
					if (openedTags[0] && openedTags[openedTags.length - 1][0] == tag.slice(1)) {
						// Pop matching opening tag
						openedTags.pop();
					}
				} else {
					if (code[position + length - 2] != '/') {
						// Opening tag
						openedTags.push([tag, 0]);
					}
				}
			} else if (openedTags[0] && type == 'punctuation') {
				last = openedTags[openedTags.length - 1];
				if (content == "{") last[1]++;
				else if (last[1] && content == "}") last[1]--;
				else {
					notTagNorBrace = true;
				}
			} else {
				notTagNorBrace = true;
			}
		}
		if (notTagNorBrace && openedTags[0] && !openedTags[openedTags.length - 1][1]) {
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

jsx[tokenize] = (code, grammar) => walkTokens(withoutTokenizer(code, grammar), code, 0);
