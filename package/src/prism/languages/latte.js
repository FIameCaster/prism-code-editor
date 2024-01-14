import { languages, tokenize } from '../core.js';
import { clone, insertBefore } from '../utils/language.js';
import { embeddedIn } from '../utils/templating.js';
import './markup.js';
import './php.js';

var markupLatte = clone(languages.html);
insertBefore(markupLatte.tag.inside, 'attr-value', {
	'n-attr': {
		pattern: /n:[\w-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+))?/,
		inside: {
			'attr-name': {
				pattern: /^[^\s=]+/,
				alias: 'important'
			},
			'attr-value': {
				pattern: /=[\s\S]+/,
				inside: {
					'punctuation': [
						/^=/,
						{
							pattern: /^(\s*)["']|["']$/,
							lookbehind: true
						}
					],
					'php': {
						pattern: /\S(?:[\s\S]*\S)?/,
						inside: 'php'
					}
				}
			},
		}
	},
});

languages.latte = {
	'latte-comment': {
		pattern: /\{\*[\s\S]*?\*\}/,
		greedy: true,
		alias: 'comment'
	},
	'latte': {
		pattern: /\{[^'"\s{}*](?:[^"'/{}]|\/(?![*/])|("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|\/\*(?:[^*]|\*(?!\/))*\*\/)*\}/g,
		greedy: true,
		inside: {
			'latte-tag': {
				// https://latte.nette.org/en/tags
				pattern: /(^\{(?:\/(?=[a-z]))?)(?:[=_]|[a-z]\w*\b(?!\())/i,
				lookbehind: true,
				alias: 'important'
			},
			'delimiter': {
				pattern: /^\{\/?|\}$/,
				alias: 'punctuation'
			},
			'php': {
				pattern: /\S(?:[\s\S]*\S)?/,
				alias: 'language-php',
				inside: 'php'
			}
		}
	},
	[tokenize]: embeddedIn(markupLatte)
};
