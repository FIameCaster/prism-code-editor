import { languages } from '../core.js';
import { clikeComment } from '../utils/shared.js';

languages.dataweave = {
	'url': /\b[A-Za-z]+:\/\/[\w/:.?=&-]+|\burn:[\w:.?=&-]+/,
	'property': {
		pattern: /(?:\b\w+#)?(?:"(?:\\.|[^\\"\n])*"|\b\w+)(?=\s*[:@])/,
		greedy: true
	},
	'string': {
		pattern: /(["'`])(?:\\[\s\S]|(?!\1)[^\\])*\1/,
		greedy: true
	},
	'mime-type': /\b(?:application|audio|image|multipart|text|video)\/[\w+-]+/,
	'date': {
		pattern: /\|[\w:+-]+\|/,
		greedy: true
	},
	'comment': clikeComment(),
	'regex': {
		pattern: /\/(?:[^\\\/\n]|\\[^\n])+\//,
		greedy: true
	},
	'keyword': /\b(?:and|as|at|case|do|else|fun|if|input|is|match|not|ns|null|or|output|type|unless|update|using|var)\b/,
	'function': /\b[A-Z_]\w*(?=\s*\()/i,
	'number': /-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i,
	'punctuation': /[{}[\];(),.:@]/,
	'operator': /<<|>>|->|[<>~=]=?|!=|--?-?|\+\+?|!|\?/,
	'boolean': /\b(?:false|true)\b/,
};