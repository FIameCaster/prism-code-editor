import { languages, tokenizeText, tokenize, withoutTokenizer } from '../core.js';
import { clone, insertBefore } from '../utils/language.js';
import './markup.js';

// Allow only one line break
var inner = /(?:\\.|[^\\\n]|\n(?!\n))/.source;

/**
 * This function is intended for the creation of the bold or italic pattern.
 *
 * This also adds a lookbehind group to the given pattern to ensure that the pattern is not backslash-escaped.
 *
 * _Note:_ Keep in mind that this adds a capturing group.
 *
 * @param {RegExp} pattern
 * @returns {RegExp}
 */
var createInline = pattern => RegExp(`((?:^|[^\\\\])(?:\\\\{2})*)(?:${pattern.source.replace(/<inner>/g, inner)})`);
var tableCell = /(?:\\.|``(?:[^`\n]|`(?!`))+``|`[^`\n]+`|[^\\|\n`])+/.source;
var tableRow = /\|?__(?:\|__)+\|?(?:\n|(?![\s\S]))/.source.replace(/__/g, tableCell);
var tableLine = /\|?[ \t]*:?-{3,}:?[ \t]*(?:\|[ \t]*:?-{3,}:?[ \t]*)+\|?\n/.source;
var markdown = languages.markdown = languages.md = clone(languages.html);

insertBefore(markdown, 'prolog', {
	'front-matter-block': {
		pattern: /(^(?:\s*\n)?)---(?!.)[\s\S]*?\n---(?!.)/,
		lookbehind: true,
		greedy: true,
		inside: {
			'punctuation': /^---|---$/,
			'front-matter': {
				pattern: /\S+(?:\s+\S+)*/,
				alias: 'language-yaml',
				inside: 'yaml'
			}
		}
	},
	'blockquote': {
		// > ...
		pattern: /^>(?:[\t ]*>)*/m,
		alias: 'punctuation'
	},
	'table': {
		pattern: RegExp('^' + tableRow + tableLine + '(?:' + tableRow + ')*', 'm'),
		inside: {
			'table-data-rows': {
				pattern: RegExp('^(' + tableRow + tableLine + ')(?:' + tableRow + ')*$'),
				lookbehind: true,
				inside: {
					'table-data': {
						pattern: RegExp(tableCell),
						inside: markdown
					},
					'punctuation': /\|/
				}
			},
			'table-line': {
				pattern: RegExp('^(' + tableRow + ')' + tableLine + '$'),
				lookbehind: true,
				inside: {
					'punctuation': /\||:?-{3,}:?/
				}
			},
			'table-header-row': {
				pattern: RegExp('^' + tableRow + '$'),
				inside: {
					'table-header': {
						pattern: RegExp(tableCell),
						alias: 'important',
						inside: markdown
					},
					'punctuation': /\|/
				}
			}
		}
	},
	'code': [
		{
			// Prefixed by 4 spaces or 1 tab and preceded by an empty line
			pattern: /(^[ \t]*\n)(?:    |\t).+(?:\n(?:    |\t).+)*/m,
			lookbehind: true,
			alias: 'keyword'
		},
		{
			// ```optional language
			// code block
			// ```
			pattern: /^```[\s\S]*?^```$/m,
			greedy: true,
			inside: {
				'punctuation': /^```/m,
				'code-language': /^.+/,
				'code-block': /(?!^)[\s\S]+(?=\n)/,
				[tokenize](code, grammar) {
					var tokens = withoutTokenizer(code, grammar);
					var [, codeLang, , codeBlock] = tokens;
					var language;

					if (codeBlock && codeBlock.type && codeLang.type) {
						language = (/[a-z][\w-]*/i.exec(
							codeLang.content.replace(/\b#/g, 'sharp').replace(/\b\+\+/g, 'pp')
						) || [''])[0].toLowerCase();
	
						codeBlock.alias = 'language-' + language;
	
						if (grammar = languages[language]) {
							codeBlock.content = tokenizeText(codeBlock.content, grammar);
						}
					}

					return tokens;
				}
			}
		}
	],
	'title': [
		{
			// title 1
			// =======

			// title 2
			// -------
			pattern: /\S.*\n(?:==+|--+)(?=[ \t]*$)/m,
			alias: 'important',
			inside: {
				punctuation: /==+$|--+$/
			}
		},
		{
			// # title 1
			// ###### title 6
			pattern: /(^\s*)#.+/m,
			lookbehind: true,
			alias: 'important',
			inside: {
				punctuation: /^#+|#+$/
			}
		}
	],
	'hr': {
		// ***
		// ---
		// * * *
		// -----------
		pattern: /(^\s*)([*-])(?:[\t ]*\2){2,}(?=\s*$)/m,
		lookbehind: true,
		alias: 'punctuation'
	},
	'list': {
		// * item
		// + item
		// - item
		// 1. item
		pattern: /(^\s*)(?:[*+-]|\d+\.)(?=[\t ].)/m,
		lookbehind: true,
		alias: 'punctuation'
	},
	'url-reference': {
		// [id]: http://example.com "Optional title"
		// [id]: http://example.com 'Optional title'
		// [id]: http://example.com (Optional title)
		// [id]: <http://example.com> "Optional title"
		pattern: /!?\[[^\]]+\]:[\t ]+(?:\S+|<(?:\\.|[^>\\])+>)(?:[\t ]+(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\)))?/,
		inside: {
			'variable': {
				pattern: /^(!?\[)[^\]]+/,
				lookbehind: true
			},
			'string': /(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\))$/,
			'punctuation': /^[\[\]!:]|[<>]/
		},
		alias: 'url'
	},
	'bold': {
		// **strong**
		// __strong__

		// allow one nested instance of italic text using the same delimiter
		pattern: createInline(/\b__(?:(?!_)<inner>|_(?:(?!_)<inner>)+_)+__\b|\*\*(?:(?!\*)<inner>|\*(?:(?!\*)<inner>)+\*)+\*\*/),
		lookbehind: true,
		greedy: true,
		inside: {
			'content': {
				pattern: /(^..)[\s\S]+(?=..)/,
				lookbehind: true,
				inside: {} // see below
			},
			'punctuation': /../
		}
	},
	'italic': {
		// *em*
		// _em_

		// allow one nested instance of bold text using the same delimiter
		pattern: createInline(/\b_(?:(?!_)<inner>|__(?:(?!_)<inner>)+__)+_\b|\*(?:(?!\*)<inner>|\*\*(?:(?!\*)<inner>)+\*\*)+\*/),
		lookbehind: true,
		greedy: true,
		inside: {
			'content': {
				pattern: /(?!^)[\s\S]+(?=.)/,
				inside: {} // see below
			},
			'punctuation': /./
		}
	},
	'strike': {
		// ~~strike through~~
		// ~strike~
		// eslint-disable-next-line regexp/strict
		pattern: createInline(/(~~?)(?:(?!~)<inner>)+\2/),
		lookbehind: true,
		greedy: true,
		inside: {
			'punctuation': /^~~?|~~?$/,
			'content': {
				pattern: /[\s\S]+/,
				inside: {} // see below
			},
		}
	},
	'code-snippet': {
		// `code`
		// ``code``
		pattern: /(^|[^\\`])(?:``[^`\n]+(?:`[^`\n]+)*``(?!`)|`[^`\n]+`(?!`))/,
		lookbehind: true,
		greedy: true,
		alias: 'code keyword'
	},
	'url': {
		// [example](http://example.com "Optional title")
		// [example][id]
		// [example] [id]
		pattern: createInline(/!?\[(?:(?!\])<inner>)+\](?:\([^\s)]+(?:[\t ]+"(?:\\.|[^"\\])*")?\)|[ \t]?\[(?:(?!\])<inner>)+\])/),
		lookbehind: true,
		greedy: true,
		inside: {
			'operator': /^!/,
			'content': {
				pattern: /(^\[)[^\]]+(?=\])/,
				lookbehind: true,
				inside: {
					'markup-bracket': markdown['markup-bracket']
				}
			},
			'variable': {
				pattern: /(^\][ \t]?\[)[^\]]+(?=\]$)/,
				lookbehind: true
			},
			'url': {
				pattern: /(^\]\()[^\s)]+/,
				lookbehind: true
			},
			'string': {
				pattern: /(^[ \t]+)"(?:\\.|[^"\\])*"(?=\)$)/,
				lookbehind: true
			},
			'markup-bracket': markdown['markup-bracket']
		}
	}
});

['url', 'bold', 'italic', 'strike'].forEach(token => {
	['url', 'bold', 'italic', 'strike', 'code-snippet'].forEach(inside => {
		if (token != inside) {
			markdown[token].inside.content.inside[inside] = markdown[inside];
		}
	});
});
