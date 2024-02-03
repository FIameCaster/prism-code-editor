import { languages } from '../core.js';

languages['visual-basic'] = {
	'comment': {
		pattern: /(?:['‘’]|REM\b)(?:[^\n_]|_\n?)*/i,
		inside: {
			'keyword': /^REM/i
		}
	},
	'directive': {
		pattern: /#(?:const|else|elseif|end|externalchecksum|externalSource|if|region)(?:\b_[ \t]*\n|.)+/i,
		alias: 'property',
		greedy: true
	},
	'string': {
		pattern: /\$?["“”](?:["“”]{2}|[^"“”])*["“”]C?/i,
		greedy: true
	},
	'date': {
		pattern: /#[ \t]*(?:\d+([/-])\d+\1\d+(?:[ \t]+(?:\d+[ \t]*(?:AM|PM)|\d+:\d+(?::\d+)?(?:[ \t]*(?:AM|PM))?))?|\d+[ \t]*(?:AM|PM)|\d+:\d+(?::\d+)?(?:[ \t]*(?:AM|PM))?)[ \t]*#/i,
		alias: 'number'
	},
	'number': /(?:(?:\b\d+(?:\.\d+)?|\.\d+)(?:E[+-]?\d+)?|&[HO][\dA-F]+)(?:[FRD]|U?[ILS])?/i,
	'boolean': /\b(?:false|nothing|true)\b/i,
	'keyword': /\b(?:addhandler|addressof|alias|and(?:also)?|as|boolean|byref|byte|byval|call|case|catch|c(?:bool|byte|char|date|dbl|dec|int|lng|obj|sbyte|short|sng|str|type|uint|ulng|ushort)|char|class|const|continue|currency|date|decimal|declare|default|delegate|dim|directcast|do|double|each|else(?:if)?|end(?:if)?|enum|erase|error|event|exit|finally|for|friend|function|get(?:type|xmlnamespace)?|global|gosub|goto|handles|if|implements|imports|in|inherits|integer|interface|is|isnot|let|lib|like|long|loop|me|mod|module|must(?:inherit|override)|my(?:base|class)|namespace|narrowing|new|next|not(?:inheritable|overridable)?|object|of|on|operator|option(?:al)?|or(?:else)?|out|overloads|overridable|overrides|paramarray|partial|private|property|protected|public|raiseevent|readonly|redim|removehandler|resume|return|sbyte|select|set|shadows|shared|short|single|static|step|stop|string|structure|sub|synclock|then|throw|to|try|trycast|type|typeof|u(?:integer|long|short)|until|using|variant|wend|when|while|widening|with(?:events)?|writeonly|xor)\b/i,
	'operator': /[+\-*/\\^<=>&#@$%!]|\b_(?=[ \t]*\n)/,
	'punctuation': /[{}().,:?]/
};

languages.vb = languages['visual-basic'];
languages.vba = languages['visual-basic'];
