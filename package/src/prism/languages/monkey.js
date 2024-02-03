import { languages } from '../core.js';

languages.monkey = {
	'comment': {
		pattern: /^#Rem\s[\s\S]*?^#End|'.+/im,
		greedy: true
	},
	'string': {
		pattern: /"[^"\n]*"/,
		greedy: true,
	},
	'preprocessor': {
		pattern: /(^[ \t]*)#.+/m,
		lookbehind: true,
		greedy: true,
		alias: 'property'
	},

	'function': /\b\w+(?=\()/,
	'type-char': {
		pattern: /\b[?%#$]/,
		alias: 'class-name'
	},
	'number': {
		pattern: /((?:\.\.)?)(?:(?:\b|\B-\.?|\B\.)\d+(?:(?!\.\.)\.\d*)?|\$[\da-f]+)/i,
		lookbehind: true
	},
	'keyword': /\b(?:abstract|array|bool|case|catch|class|const|continue|default|eachin|else|elseif|end|endif|exit|extends|extern|false|field|final|float|for|forever|function|global|if|implements|import|inline|int|interface|local|method|module|new|next|null|object|private|property|public|repeat|return|select|self|step|strict|string|super|then|throw|to|true|try|until|void|wend|while)\b/i,
	'operator': /\.\.|<[=>]?|>=?|:?=|(?:[+\-*\/&~|]|\b(?:mod|shl|shr)\b)=?|\b(?:and|not|or)\b/i,
	'punctuation': /[.,:;()[\]]/
};
