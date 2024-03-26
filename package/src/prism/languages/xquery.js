import { languages, Token, tokenize, withoutTokenizer } from '../core.js';
import { extend } from '../utils/language.js';
import { re } from '../utils/shared.js';
import './markup.js';

var xquery = languages.xquery = extend('xml', {
	'xquery-comment': {
		pattern: /\(:[\s\S]*?:\)/g,
		greedy: true,
		alias: 'comment'
	},
	'string': {
		pattern: /"(?:""|[^"])*"|'(?:''|[^'])*'/g,
		greedy: true
	},
	'extension': {
		pattern: /\(#.+?#\)/,
		alias: 'symbol'
	},
	'variable': /\$[-\w:]+/,
	'axis': {
		pattern: /(^|[^-])(?:ancestor(?:-or-self)?|attribute|child|descendant(?:-or-self)?|following(?:-sibling)?|parent|preceding(?:-sibling)?|self)(?=::)/,
		lookbehind: true,
		alias: 'operator'
	},
	'keyword-operator': {
		pattern: /(^|[^:-])\b(?:and|castable as|eq|except|[gl][et]|i?div|instance of|intersect|is|mod|ne|or|union)\b(?=$|[^:-])/,
		lookbehind: true,
		alias: 'operator'
	},
	'keyword': {
		pattern: /(^|[^:-])\b(?:as|ascending|at|base-uri|boundary-space|case|cast as|collation|construction|copy-namespaces|declare|default|descending|else|empty (?:greatest|least)|encoding|every|external|for|function|if|import|in|inherit|lax|let|map|module|namespace|no-inherit|no-preserve|option|order(?: by|ed|ing)?|preserve|return|satisfies|schema|some|stable|strict|strip|then|to|treat as|typeswitch|unordered|validate|variable|version|where|xquery)\b(?=$|[^:-])/,
		lookbehind: true
	},
	'function': /[\w-]+(?::[\w-]+)*(?=\s*\()/,
	'xquery-element': {
		pattern: /(element\s+)[\w-]+(?::[\w-]+)*/,
		lookbehind: true,
		alias: 'tag'
	},
	'xquery-attribute': {
		pattern: /(attribute\s+)[\w-]+(?::[\w-]+)*/,
		lookbehind: true,
		alias: 'attr-name'
	},
	'builtin': {
		pattern: /(^|[^:-])\b(?:attribute|comment|document|element|processing-instruction|text|xs:(?:ENTITIES|ENTITY|ID|IDREFS?|NCName|NMTOKENS?|NOTATION|Q?Name|anyAtomicType|anyType|anyURI|base64Binary|boolean|byte|date|dateTime|dayTimeDuration|decimal|double|duration|float|gDay|gMonth|gMonthDay|gYear|gYearMonth|hexBinary|int|integer|language|long|negativeInteger|nonNegativeInteger|nonPositiveInteger|normalizedString|positiveInteger|short|string|time|token|unsigned(?:Byte|Int|Long|Short)|untyped(?:Atomic)?|yearMonthDuration))\b(?=$|[^:-])/,
		lookbehind: true
	},
	'number': /\b\d+(?:\.\d+)?(?:E[+-]?\d+)?/,
	'operator': {
		pattern: /[=?|@*+]|\.\.?|:=|!=|<[=<]?|>[=>]?|(\s)-(?!\S)/,
		lookbehind: true
	},
	'punctuation': /[()[\]{},:;/]/,
	[tokenize]: (code, grammar) => walkTokens(withoutTokenizer(code, grammar), code, 0)
});

var tag = xquery.tag;
var attrValue = tag.inside['attr-value'][0];
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
		var type = token.type;
		var notTagNorBrace = !type;
		var last, tag, start, plainText, content;

		if (type && type != 'comment') {
			content = token.content;
			if (type == 'tag') {
				// We found a tag, now find its kind
				start = content[0].length;
				tag = code.substr(position + start, content[1].length);
				if (start > 1) {
					// Closing tag
					if (l && openedTags[l - 1][0] == tag) {
						// Pop matching opening tag
						l--;
					}
				} else {
					if (content[content.length - 1].length < 2) {
						// Opening tag
						openedTags[l++] = [tag, 0];
					}
				}
			} else if (l && type == 'punctuation') {
				last = openedTags[l - 1];
				if (content == '{') {
					// Ignore `{{`
					if (code[position + 1] == content) {
						tokens[i + 1] = content;
						notTagNorBrace = true;
					} else {
						last[1]++;
					}
				}
				else if (last[1] && content == '}') last[1]--;
				else {
					notTagNorBrace = true;
				}
			} else {
				notTagNorBrace = true;
			}
		}
		if (notTagNorBrace && l && !openedTags[l - 1][1]) {
			// Here we are inside a tag, and not inside an XQuery expression.
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
			tokens[i] = new Token('plain-text', plainText, plainText);
		}
		position += length;
	}
	return tokens;
};

// Allow for two levels of nesting
var expression = [/\{(?!\{)(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})*\}/.source];

tag.pattern = re(/<\/?(?!\d)[^\s/=>$<%]+(?:\s+[^\s/=>]+(?:\s*=\s*(["'])(?:\{\{|<0>|(?!\1)[^{])*\1)?)*\s*\/?>/.source, expression, 'g');
attrValue.pattern = re(/(=\s*)(["'])(?:\{\{|<0>|(?!\2)[^{])*\2/.source, expression, 'g');
attrValue.inside['expression'] = {
	pattern: re(/((?:^|[^{])(?:\{\{)*)<0>/.source, expression),
	lookbehind: true,
	alias: 'language-xquery',
	inside: xquery
};
delete xquery['markup-bracket'];
