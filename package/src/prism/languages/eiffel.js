import { languages } from '../core.js';

languages.eiffel = {
	'comment': /--.*/,
	'string': [
		// Aligned-verbatim-strings
		{
			pattern: /"([^[]*)\[[\s\S]*?\]\1"/g,
			greedy: true
		},
		// Non-aligned-verbatim-strings
		{
			pattern: /"([^{]*)\{[\s\S]*?\}\1"/g,
			greedy: true
		},
		// Single-line string
		{
			pattern: /"(?:%(?:(?!\n)\s)*\n\s*%|%\S|[^%"\n])*"/g,
			greedy: true
		}
	],
	// normal char | special char | char code
	'char': /'(?:%.|[^%'\n])+'/,
	'keyword': /\b(?:across|agent|alias|all|and|as|assign|attached|attribute|check|class|convert|create|Current|debug|deferred|detachable|do|else|elseif|end|ensure|expanded|export|external|feature|from|frozen|if|implies|inherit|inspect|invariant|like|local|loop|not|note|obsolete|old|once|or|Precursor|redefine|rename|require|rescue|Result|retry|select|separate|some|then|undefine|until|variant|Void|when|xor)\b/i,
	'boolean': /\b(?:False|True)\b/i,
	// Convention: class-names are always all upper-case characters
	'class-name': /\b[A-Z][A-Z\d_]*\b/,
	'number': [
		// hexa | octal | bin
		/\b0[xcb][a-f\d](?:_*[a-f\d])*\b/i,
		// Decimal
		/(?:\b\d(?:_*\d)*)?\.(?:(?:\d(?:_*\d)*)?e[+-]?)?\d(?:_*\d)*\b|\b\d(?:_*\d)*\b\.?/i
	],
	'punctuation': /:=|<<|>>|\(\||\|\)|->|\.(?=\w)|[()[\]{},:;?]/,
	'operator': /\\\\|\|\.\.\||\.\.|\/[~/=]?|[<>]=?|[*^=~+-]/
};
