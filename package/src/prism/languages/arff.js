import { languages } from '../core.js';

languages.arff = {
	'comment': /%.*/,
	'string': {
		pattern: /(["'])(?:\\.|(?!\1)[^\\\n])*\1/g,
		greedy: true
	},
	'keyword': /@(?:attribute|data|end|relation)\b/i,
	'number': /\b\d+(?:\.\d+)?\b/,
	'punctuation': /[{},]/
};
