import { languages, tokenize } from '../core.js';
import { embeddedIn } from '../utils/templating.js';
import './markup.js';

var smartyPattern = /\{(?:[^{}"']|"(?:\\.|[^\\\n"])*"|'(?:\\.|[^\\\n'])*'|\{(?:[^{}"']|"(?:\\.|[^\\\n"])*"|'(?:\\.|[^\\\n'])*'|\{(?:[^{}"']|"(?:\\.|[^\\\n"])*"|'(?:\\.|[^\\\n'])*')*\})*\})*\}/g;

var expression = {
	pattern: /[\s\S]+/
};

var smarty = expression.inside = {
	'string': [
		{
			pattern: /"(?:\\.|[^\\\n"])*"/g,
			greedy: true,
			inside: {
				'interpolation': {
					pattern: /\{[^{}]*\}|`[^`]*`/,
					inside: {
						'interpolation-punctuation': {
							pattern: /^[{`]|[`}]$/,
							alias: 'punctuation'
						},
						'expression': expression
					}
				},
				'variable': /\$\w+/
			}
		},
		{
			pattern: /'(?:\\.|[^\\\n'])*'/g,
			greedy: true
		},
	],
	'keyword': {
		pattern: /(^\{\/?)[a-z_]\w*\b(?!\()/gi,
		lookbehind: true,
		greedy: true
	},
	'delimiter': {
		pattern: /^\{\/?|\}$/g,
		greedy: true,
		alias: 'punctuation'
	},
	'number': /\b0x[a-fA-F\d]+|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:[Ee][-+]?\d+)?/,
	'variable': [
		/\$(?!\d)\w+/,
		/#(?!\d)\w+#/,
		{
			pattern: /(\.|->|\w\s*=)(?!\d)\w+\b(?!\()/,
			lookbehind: true
		},
		{
			pattern: /(\[)(?!\d)\w+(?=\])/,
			lookbehind: true
		}
	],
	'function': {
		pattern: /(\|\s*)@?[a-z_]\w*|\b[a-z_]\w*(?=\()/i,
		lookbehind: true
	},
	'attr-name': /\b[a-z_]\w*(?=\s*=)/i,
	'boolean': /\b(?:false|no|off|on|true|yes)\b/,
	'punctuation': /[()[\]{}.,:`]|->/,
	'operator': [
		/[*/%+-]|==?=?|[!<>]=?|&&|\|\|?/,
		/\bis\s+(?:not\s+)?(?:div|even|odd)(?:\s+by)?\b/,
		/\b(?:and|eq|gt?e|gt|lt?e|lt|mod|neq?|not|or)\b/
	]
};

languages.smarty = {
	'ignore-literal': {
		pattern: /(\{literal\})[\s\S]*?(?=\{\/literal\})/g,
		lookbehind: true,
		greedy: true
	},
	'embedded-php': {
		pattern: /(\{php\})[\s\S]*?(?=\{\/php\})/g,
		lookbehind: true,
		greedy: true,
		alias: 'language-php',
		inside: 'php'
	},
	'smarty-comment': {
		pattern: /\{\*[\s\S]*?\*\}/g,
		greedy: true,
		alias: 'comment'
	},
	'smarty': {
		pattern: smartyPattern,
		greedy: true,
		inside: smarty
	},
	[tokenize]: embeddedIn('markup')
}
