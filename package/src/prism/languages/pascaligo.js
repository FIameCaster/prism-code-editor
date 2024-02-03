import { languages } from '../core.js';

// Pascaligo is a layer 2 smart contract language for the tezos blockchain

var braces = /\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*\)/.source;
var type = /(?:\b\w+(?:<braces>)?|<braces>)/.source.replace(/<braces>/g, braces);

var pascaligo = languages.pascaligo = {
	'comment': /\(\*[\s\S]+?\*\)|\/\/.*/,
	'string': {
		pattern: /(["'`])(?:\\[\s\S]|(?!\1)[^\\])*\1|\^[a-z]/i,
		greedy: true
	},
	'class-name': [
		{
			pattern: RegExp(/(\btype\s+\w+\s+is\s+)<type>/.source.replace(/<type>/g, type), 'i'),
			lookbehind: true
		},
		{
			pattern: RegExp(/<type>(?=\s+is\b)/.source.replace(/<type>/g, type), 'i')
		},
		{
			pattern: RegExp(/(:\s*)<type>/.source.replace(/<type>/g, type)),
			lookbehind: true
		}
	],
	'keyword': {
		pattern: /(^|[^&])\b(?:begin|block|case|const|else|end|fail|for|from|function|if|is|nil|of|remove|return|skip|then|type|var|while|with)\b/i,
		lookbehind: true
	},
	'boolean': {
		pattern: /(^|[^&])\b(?:False|True)\b/i,
		lookbehind: true
	},
	'builtin': {
		pattern: /(^|[^&])\b(?:bool|int|list|map|nat|record|string|unit)\b/i,
		lookbehind: true
	},
	'function': /\b\w+(?=\s*\()/,
	'number': [
		// Hexadecimal, octal and binary
		/%[01]+|&[0-7]+|\$[a-f\d]+/i,
		// Decimal
		/\b\d+(?:\.\d+)?(?:e[+-]?\d+)?(?:mtz|n)?/i
	],
	'operator': /->|=\/=|\.\.|\*\*|:=|<[<=>]?|>[>=]?|[+\-*\/]=?|[@^=|]|\b(?:and|mod|or)\b/,
	'punctuation': /\(\.|\.\)|[()[\]:;,.{}]/
};

var classNameInside = ['comment', 'keyword', 'builtin', 'operator', 'punctuation'].reduce((accum, key) => {
	accum[key] = pascaligo[key];
	return accum;
}, {});

pascaligo['class-name'].forEach(p => {
	p.inside = classNameInside;
});
