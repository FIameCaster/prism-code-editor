import { languages } from '../core.js';

var keywords = /\b(?:abstype|and|andalso|as|case|datatype|do|else|end|eqtype|exception|fn|fun|functor|handle|if|in|include|infix|infixr|let|local|nonfix|of|op|open|orelse|raise|rec|sharing|sig|signature|struct|structure|then|type|val|where|while|with|withtype)\b/i;

var class0 = {
	// This is only an approximation since the real grammar is context-free
	//
	// Why the main loop so complex?
	// The main loop is approximately the same as /(?:\s*(?:[*,]|->)\s*<TERMINAL>)*/ which is, obviously, a lot
	// simpler. The difference is that if a comma is the last iteration of the loop, then the terminal must be
	// followed by a long identifier.
	pattern: RegExp(
		/((?:^|[^:]):\s*)<TERMINAL>(?:\s*(?:(?:\*|->)\s*<TERMINAL>|,\s*<TERMINAL>(?:(?=\s*(?:[*,]|->))|(?!\s*(?:[*,]|->))\s+<LONG-ID>)))*/.source
			.replace(/<TERMINAL>/g, 
				/(?:'[\w']*|<LONG-ID>|\((?:[^()]|\([^()]*\))*\)|\{(?:[^{}]|\{[^{}]*\})*\})(?:\s+<LONG-ID>)*/.source
			)
			.replace(/<LONG-ID>/g, `(?!${keywords.source})[a-z\\d_][\\w'.]*`),
		'i'
	),
	lookbehind: true,
	greedy: true
};

class0.inside = languages.smlnj = languages.sml = {
	// allow one level of nesting
	'comment': /\(\*(?:[^*(]|\*(?!\))|\((?!\*)|\(\*(?:[^*(]|\*(?!\))|\((?!\*))*\*\))*\*\)/,
	'string': {
		pattern: /#?"(?:[^"\\]|\\.)*"/,
		greedy: true
	},

	'class-name': [
		class0,
		{
			pattern: /((?:^|[^\w'])(?:datatype|exception|functor|signature|structure|type)\s+)[a-z_][\w'.]*/i,
			lookbehind: true
		}
	],
	'function': {
		pattern: /((?:^|[^\w'])fun\s+)[a-z_][\w'.]*/i,
		lookbehind: true
	},

	'keyword': keywords,
	'variable': {
		pattern: /(^|[^\w'])'[\w']*/,
		lookbehind: true,
	},

	'number': /~?\b(?:\d+(?:\.\d+)?(?:e~?\d+)?|0x[\da-f]+)\b/i,
	'word': {
		pattern: /\b0w(?:\d+|x[\da-f]+)\b/i,
		alias: 'constant'
	},

	'boolean': /\b(?:false|true)\b/i,
	'operator': /\.{3}|:[>=:]|=>?|->|[<>]=?|[!+\-*/^#|@~]/,
	'punctuation': /[(){}\[\].:,;]/
};
