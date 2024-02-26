import { languages } from '../core.js';

languages.xojo = {
	'comment': {
		pattern: /(?:'|\/\/|rem\b).+/gi,
		greedy: true
	},
	'string': {
		pattern: /"(?:""|[^"])*"/g,
		greedy: true
	},
	'number': [
		/(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:E[+-]?\d+)?/i,
		/&[bchou][a-z\d]+/i
	],
	'directive': {
		pattern: /#(?:else|elseif|endif|if|pragma)\b/i,
		alias: 'property'
	},
	'keyword': /\b(?:addhandler|app|array|as(?:signs)?|auto|boolean|break|by(?:ref|val)|byte|call|case|catch|cfstringref|cgfloat|class|color|const|continue|cstring|currency|currentmethodname|declare|delegate|dim|do(?:uble|wnto)?|each|else(?:if)?|end|enumeration|event|exception|exit|extends|false|finally|for|function|get|gettypeinfo|global|goto|if|implements|in|inherits|int(?:8|16|32|64|eger|erface)?|lib|loop|me|module|next|nil|object|optional|ostype|paramarray|private|property|protected|pstring|ptr|raise(?:event)?|redim|removehandler|return|select(?:or)?|self|set|shared|short|single|soft|static|step|string|sub|super|text|then|to|true|try|ubound|uint(?:8|16|32|64|eger)?|until|using|var(?:iant)?|wend|while|windowptr|wstring)\b/i,
	'operator': /<[=>]?|>=?|[*/\\^=+-]|\b(?:addressof|and|ctype|isa?|mod|new|not|or|weakaddressof|xor)\b/i,
	'punctuation': /[().,:;]/
};
