import { languages, tokenize, withoutTokenizer } from '../core.js';

var expressionDef = /\{[^\n[\]{}]*\}/;

var params = {
	'quoted-string': {
		pattern: /"(?:[^"\\]|\\.)*"/,
		alias: 'operator'
	},
	'command-param-id': {
		pattern: /(\s)\w+:/,
		lookbehind: true,
		alias: 'property'
	},
	'command-param-value': [
		{
			pattern: expressionDef,
			alias: 'selector',
		},
		{
			pattern: /([\t ])\S+/,
			lookbehind: true,
			greedy: true,
			alias: 'operator',
		},
		{
			pattern: /\S(?:.*\S)?/,
			alias: 'operator',
		}
	]
};

/**
 * @param {string} input
 * @returns {boolean}
 */
var isBadLine = input => {
	for (var brackets = '[]{}', stack = [], i = 0, l = input.length; i < l; ) {
		var bracketsIndex = brackets.indexOf(input[i++]);
		if (bracketsIndex + 1) {
			if (bracketsIndex % 2) {
				if (stack.pop() != bracketsIndex) return true;
			} else stack.push(bracketsIndex + 1);
		}
	}
	return stack.length;
}

languages.nani = languages.naniscript = {
	// ; ...
	'comment': {
		pattern: /^([\t ]*);.*/m,
		lookbehind: true,
	},
	// > ...
	// Define is a control line starting with '>' followed by a word, a space and a text.
	'define': {
		pattern: /^>.+/m,
		alias: 'tag',
		inside: {
			'value': {
				pattern: /(^>\w+[\t ]+)(?!\s)[^{}\n]+/,
				lookbehind: true,
				alias: 'operator'
			},
			'key': {
				pattern: /(^>)\w+/,
				lookbehind: true,
			}
		}
	},
	// # ...
	'label': {
		pattern: /^([\t ]*)#[\t ]*\w+[\t ]*$/m,
		lookbehind: true,
		alias: 'regex'
	},
	'command': {
		pattern: /^([\t ]*)@\w+(?=[\t ]|$).*/m,
		lookbehind: true,
		alias: 'function',
		inside: {
			'command-name': /^@\w+/,
			'expression': {
				pattern: expressionDef,
				greedy: true,
				alias: 'selector'
			},
			'command-params': {
				pattern: /\s*\S[\s\S]*/,
				inside: params
			},
		}
	},
	// Generic is any line that doesn't start with operators: ;>#@
	'generic-text': {
		pattern: /(^[ \t]*)[^#@>;\s].*/m,
		lookbehind: true,
		alias: 'punctuation',
		inside: {
			// \{ ... \} ... \[ ... \] ... \"
			'escaped-char': /\\[{}[\]"]/,
			'expression': {
				pattern: expressionDef,
				greedy: true,
				alias: 'selector'
			},
			'inline-command': {
				pattern: /\[[\t ]*\w[^\n[\]]*\]/,
				greedy: true,
				alias: 'function',
				inside: {
					'command-params': {
						pattern: /(^\[[\t ]*\w+\b)[\s\S]+(?=\]$)/,
						lookbehind: true,
						inside: params
					},
					'command-param-name': {
						pattern: /^(\[[\t ]*)\w+/,
						lookbehind: true,
						alias: 'name',
					},
					'start-stop-char': /[[\]]/,
				}
			}
		}
	},
	[tokenize](code, grammar) {
		var tokens = withoutTokenizer(code, grammar);
		var position = 0;
		var i = 0, l = tokens.length;
		while (i < l) {
			var token = tokens[i++];
			var length = token.length;
			var content;

			if (token.type == 'generic-text') {
				content = code.slice(position, position + length);
				if (isBadLine(content)) {
					token.type = 'bad-line';
					token.content = content;
				}
			}

			position += length;
		}
		return tokens;
	}
};
