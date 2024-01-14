import { languages, Token, tokenize, withoutTokenizer } from '../core.js';
import { extend } from '../utils/language.js';
import './markup.js';

var xquery = languages.xquery = extend('markup', {
	'xquery-comment': {
		pattern: /\(:[\s\S]*?:\)/,
		greedy: true,
		alias: 'comment'
	},
	'string': {
		pattern: /(["'])(?:\1\1|(?!\1)[\s\S])*\1/,
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
		pattern: /(^|[^:-])\b(?:and|castable as|div|eq|except|ge|gt|idiv|instance of|intersect|is|le|lt|mod|ne|or|union)\b(?=$|[^:-])/,
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
		pattern: /(^|[^:-])\b(?:attribute|comment|document|element|processing-instruction|text|xs:(?:ENTITIES|ENTITY|ID|IDREFS?|NCName|NMTOKENS?|NOTATION|Name|QName|anyAtomicType|anyType|anyURI|base64Binary|boolean|byte|date|dateTime|dayTimeDuration|decimal|double|duration|float|gDay|gMonth|gMonthDay|gYear|gYearMonth|hexBinary|int|integer|language|long|negativeInteger|nonNegativeInteger|nonPositiveInteger|normalizedString|positiveInteger|short|string|time|token|unsigned(?:Byte|Int|Long|Short)|untyped(?:Atomic)?|yearMonthDuration))\b(?=$|[^:-])/,
		lookbehind: true
	},
	'number': /\b\d+(?:\.\d+)?(?:E[+-]?\d+)?/,
	'operator': {
		pattern: /[+*=?|@]|\.\.?|:=|!=|<[=<]?|>[=>]?|(\s)-(?=\s)/,
		lookbehind: true
	},
	'punctuation': /[[\](){},;:/]/,
	[tokenize]: (code, grammar) => walkTokens(withoutTokenizer(code, grammar), code, 0)
});

var tag = xquery.tag;
var attrValue = tag.inside['attr-value'];
var isText = token => token && (!token.type || token.type == 'plain-text');

var walkTokens = (tokens, code, position) => {
	for (var i = 0, openedTags = []; i < tokens.length; i++) {
		var token = tokens[i];
		var length = token.length;
		var content = token.content;
		var type = token.type;
		var notTagNorBrace = !type;
		var last, tag, start, plainText;

		if (type && type != 'comment') {
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
				if (content == "{" && code[position - 1] != "{" && code[position + 1] != "{") last[1]++;
				else if (last[1] && content == "}") last[1]--;
				else {
					notTagNorBrace = true;
				}
			} else {
				notTagNorBrace = true;
			}
		}
		if (notTagNorBrace && openedTags[0] && !openedTags[openedTags.length - 1][1]) {
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
			tokens[i] = plainText.trimEnd() ? new Token('plain-text', plainText, plainText, null) : plainText;
		}
		else if (Array.isArray(content)) {
			walkTokens(content, code, position);
		}
		position += length;
	}
	return tokens;
};

tag.pattern = /<\/?(?!\d)[^\s>\/=$<%]+(?:\s+[^\s>\/=]+(?:=(?:("|')(?:\\[\s\S]|\{(?!\{)(?:\{(?:\{[^{}]*\}|[^{}])*\}|[^{}])+\}|(?!\1)[^\\])*\1|[^\s'">=]+))?)*\s*\/?>/;
attrValue.pattern = /=(?:("|')(?:\\[\s\S]|\{(?!\{)(?:\{(?:\{[^{}]*\}|[^{}])*\}|[^{}])+\}|(?!\1)[^\\])*\1|[^\s'">=]+)/;
attrValue.inside['punctuation'] = /^="|"$/;
attrValue.inside['expression'] = {
	// Allow for two levels of nesting
	pattern: /\{(?!\{)(?:\{(?:\{[^{}]*\}|[^{}])*\}|[^{}])+\}/,
	inside: xquery,
	alias: 'language-xquery'
};
delete xquery['markup-bracket'];
