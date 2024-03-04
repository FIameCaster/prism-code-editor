import { languages, rest } from '../core.js';
import { nested, replace } from '../utils/shared.js';

var stringPattern = /'[{}:=,](?:[^']|'')*'(?!')/g;

var escape = {
	pattern: /''/g,
	greedy: true,
	alias: 'operator'
};
var string = {
	pattern: stringPattern,
	greedy: true,
	inside: {
		'escape': escape
	}
};

var message = {
	pattern: /(?!^)[\s\S]+(?=.)/
};

var choiceStyleInside = {
	'punctuation': /\|/,
	'range': {
		pattern: /^(\s*)[+-]?(?:\d+(?:\.\d*)?|∞)\s*[<#≤]/,
		lookbehind: true,
		inside: {
			'operator': /[<#≤]/,
			'number': /\S+/
		}
	}
};

var argumentSource = nested(
	replace(/\{(?:[^{}']|'(?![{},'])|''|<0>|<self>)*\}/.source, [stringPattern.source]), 3
);

var nestedMessage = {
	pattern: RegExp(argumentSource),
	inside: {
		'message': message,
		'message-delimiter': {
			pattern: /./,
			alias: 'punctuation'
		}
	}
};

choiceStyleInside[rest] = message.inside = languages['icu-message-format'] = {
	'argument': {
		pattern: RegExp(argumentSource, 'g'),
		greedy: true,
		inside: {
			'content': {
				pattern: /(?!^)[\s\S]+(?=.)/,
				inside: {
					'argument-name': {
						pattern: /^(\s*)[^{}:=,\s]+/,
						lookbehind: true
					},
					'choice-style': {
						// https://unicode-org.github.io/icu-docs/apidoc/released/icu4c/classicu_1_1ChoiceFormat.html#details
						pattern: /^(\s*,\s*choice\s*,\s*)\S(?:[\s\S]*\S)?/,
						lookbehind: true,
						inside: choiceStyleInside
					},
					'plural-style': {
						// https://unicode-org.github.io/icu-docs/apidoc/released/icu4j/com/ibm/icu/text/PluralFormat.html#:~:text=Patterns%20and%20Their%20Interpretation
						pattern: /^(\s*,\s*(?:plural|selectordinal)\s*,\s*)\S(?:[\s\S]*\S)?/,
						lookbehind: true,
						inside: {
							'offset': /^offset:\s*\d+/,
							'nested-message': nestedMessage,
							'selector': {
								pattern: /=\d+|[^{}:=,\s]+/,
								inside: {
									'keyword': /^(?:few|many|one|other|two|zero)$/
								}
							}
						}
					},
					'select-style': {
						// https://unicode-org.github.io/icu-docs/apidoc/released/icu4j/com/ibm/icu/text/SelectFormat.html#:~:text=Patterns%20and%20Their%20Interpretation
						pattern: /^(\s*,\s*select\s*,\s*)\S(?:[\s\S]*\S)?/,
						lookbehind: true,
						inside: {
							'nested-message': nestedMessage,
							'selector': {
								pattern: /[^{}:=,\s]+/,
								inside: {
									'keyword': /^other$/
								}
							}
						}
					},
					'keyword': /\b(?:choice|plural|select|selectordinal)\b/,
					'arg-type': {
						pattern: /\b(?:date|duration|number|ordinal|spellout|time)\b/,
						alias: 'keyword'
					},
					'arg-skeleton': {
						pattern: /(,\s*)::[^{}:=,\s]+/,
						lookbehind: true
					},
					'arg-style': {
						pattern: /(,\s*)(?:currency|full|integer|long|medium|percent|short)(?=\s*$)/,
						lookbehind: true
					},
					'arg-style-text': {
						pattern: RegExp(/(^\s*,\s*(?!\s))/.source + nested(/(?:[^{}']|'[^']*'|\{(?:<self>)?\})+/.source, 3) + '$'),
						lookbehind: true,
						alias: 'string'
					},
					'punctuation': /,/
				}
			},
			'argument-delimiter': {
				pattern: /./,
				alias: 'operator'
			}
		}
	},
	'escape': escape,
	'string': string
};
