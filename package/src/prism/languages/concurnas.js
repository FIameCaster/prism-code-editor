import { languages } from '../core.js';

languages.conc = languages.concurnas = {
	'comment': {
		pattern: /(?:\/\*[\s\S]*?(?:\*\/|$)|\/\/.*)/,
		greedy: true
	},
	'regex-literal': {
		pattern: /\br("|')(?:\\.|(?!\1)[^\\\n])*\1/,
		greedy: true,
		inside: {
			'interpolation': {
				pattern: /((?:^|[^\\])(?:\\{2})*)\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/,
				lookbehind: true,
				inside: 'conc'
			},
			'regex': /[\s\S]+/
		}
	},
	'string-literal': {
		pattern: /(?:\B|\bs)("|')(?:\\.|(?!\1)[^\\\n])*\1/,
		greedy: true,
		inside: {
			'interpolation': {
				pattern: /((?:^|[^\\])(?:\\{2})*)\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/,
				lookbehind: true,
				inside: 'conc'
			},
			'string': /[\s\S]+/
		}
	},
	'langext': {
		pattern: /\b\w+\s*\|\|[\s\S]+?\|\|/,
		greedy: true,
		inside: {
			'class-name': /^\w+/,
			'string': {
				pattern: /(^\s*..)[\s\S]+(?=..)/,
				lookbehind: true
			},
			'punctuation': /\|\|/
		}
	},
	'function': {
		pattern: /((?:^|\s)def[ \t]+)[a-zA-Z_]\w*(?=\s*\()/,
		lookbehind: true
	},
	'keyword': /\b(?:abstract|actor|also|annotation|assert|async|await|bool|boolean|break|byte|case|catch|changed|char|class|closed|constant|continue|def|default|del|double|elif|else|enum|every|extends|false|finally|float|for|from|global|gpudef|gpukernel|if|import|in|init|inject|int|lambda|local|long|loop|match|new|nodefault|null|of|onchange|open|out|override|package|parfor|parforsync|post|pre|private|protected|provide|provider|public|return|shared|short|single|size_t|sizeof|super|sync|this|throw|trait|trans|transient|true|try|typedef|unchecked|using|val|var|void|while|with)\b/,
	'boolean': /\b(?:false|true)\b/,
	'number': /\b0b[01][01_]*L?\b|\b0x(?:[\da-f_]*\.)?[\da-f_p+-]+\b|(?:\b\d[\d_]*(?:\.[\d_]*)?|\B\.\d[\d_]*)(?:e[+-]?\d[\d_]*)?[dfls]?/i,
	'punctuation': /[{}[\];(),.:]/,
	'operator': /<==|>==|=>|->|<-|<>|&==|&<>|\?:?|\.\?|\+\+|--|[-+*/=<>]=?|[!^~]|\b(?:and|as|band|bor|bxor|comp|is|isnot|mod|or)\b=?/,
	'annotation': {
		pattern: /@(?:\w+:)?(?:\w+|\[[^\]]+\])?/,
		alias: 'builtin'
	}
};