import { languages } from '../core.js';

var variable = /%%?[~:\w]+%?|!\S+!/;
var parameter = {
	pattern: /\/[a-z?]+(?![^ :]):?|-[a-z]\b|--[a-z-]+\b/im,
	alias: 'attr-name',
	inside: {
		'punctuation': /:/
	}
};
var string = /"(?:[\\"]"|[^"])*"(?!")/;
var number = /(?:\b|-)\d+\b/;

languages.batch = {
	'comment': {
		pattern: /^::.*|((?:^|[&(])[ \t]*)rem\b(?:[^^&)\n]|\^[\s\S])*/im,
		lookbehind: true
	},
	'label': {
		pattern: /^:.*/m,
		alias: 'property'
	},
	'command': [
		{
			// FOR command
			pattern: /((?:^|[&(])[ \t]*)for(?: \/[a-z?](?:[ :](?:"[^"]*"|[^\s"/]\S*))?)* \S+ in \([^)]+\) do/im,
			lookbehind: true,
			inside: {
				'keyword': /\b(?:do|in)\b|^for\b/i,
				'string': string,
				'parameter': parameter,
				'variable': variable,
				'number': number,
				'punctuation': /[()',]/
			}
		},
		{
			// IF command
			pattern: /((?:^|[&(])[ \t]*)if(?: \/[a-z?](?:[ :](?:"[^"]*"|[^\s"/]\S*))?)* (?:not )?(?:cmdextversion \d+|defined \w+|errorlevel \d+|exist \S+|(?:"[^"]*"|(?!")(?:(?!==)\S)+)?(?:==| (?:equ|[gln]eq|gtr|lss) )(?:"[^"]*"|[^\s"]\S*))/im,
			lookbehind: true,
			inside: {
				'keyword': /\b(?:cmdextversion|defined|errorlevel|exist|not)\b|^if\b/i,
				'string': string,
				'parameter': parameter,
				'variable': variable,
				'number': number,
				'operator': /\^|==|\b(?:equ|[gln]eq|gtr|lss)\b/i
			}
		},
		{
			// ELSE command
			pattern: /((?:^|[&()])[ \t]*)else\b/im,
			lookbehind: true,
			inside: {
				'keyword': /.+/
			}
		},
		{
			// SET command
			pattern: /((?:^|[&(])[ \t]*)set(?: \/[a-z](?:[ :](?:"[^"]*"|[^\s"/]\S*))?)* (?:[^^&)\n]|\^[\s\S])*/im,
			lookbehind: true,
			inside: {
				'keyword': /^set\b/i,
				'string': string,
				'parameter': parameter,
				'variable': [
					variable,
					/\w+(?=(?:[*/%&^|+-]|<<|>>)?=)/
				],
				'number': number,
				'operator': /[%&|^/*+-]=?|<<=?|>>=?|[!~_=]/,
				'punctuation': /[()',]/
			}
		},
		{
			// Other commands
			pattern: /((?:^|[&(])[ \t]*@?)\w+\b(?:"(?:[\\"]"|[^"])*"(?!")|[^"^&)\n]|\^[\s\S])*/m,
			lookbehind: true,
			inside: {
				'keyword': /^\w+/,
				'string': string,
				'parameter': parameter,
				'label': {
					pattern: /(^\s*):\S+/m,
					lookbehind: true,
					alias: 'property'
				},
				'variable': variable,
				'number': number,
				'operator': /\^/
			}
		}
	],
	'operator': /[&@]/,
	'punctuation': /[()']/
};
