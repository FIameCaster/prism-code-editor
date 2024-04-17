import { languages } from '../core.js';
import { clikeComment, clikePunctuation } from '../utils/patterns.js';

// https://qiskit.github.io/openqasm/grammar/index.html

languages.qasm = languages.openqasm = {
	'string': /"[^\n\t"]*"|'[^\n\t']*'/,
	'comment': clikeComment(),

	'keyword': /\b(?:CX|OPENQASM|U|barrier|boxas|boxto|break|const|continue|ctrl|def|defcal|defcalgrammar|delay|else|end|for|gate|gphase|if|include|inv?|kernel|lengthof|let|measure|pow|reset|return|rotary|stretchinf|while)\b|#pragma\b/,
	'class-name': /\b(?:angle|bit|bool|[cq]reg|fixed|float|length|qubit|stretch|u?int)\b/,
	'function': /\b(?:cos|exp|ln|popcount|rot[lr]|sin|sqrt|tan)\b(?=\s*\()/,

	'constant': /\b(?:euler|pi|tau)\b|π|𝜏|ℇ/,
	'number': {
		pattern: /(^|[^$\w.])(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?(?:dt|[nuµm]?s)?/i,
		lookbehind: true
	},
	'operator': /->|--|\+\+|&&|\|\||>>=?|<<=?|[~%&|^!=<>/*+-]=?|@/,
	'punctuation': clikePunctuation
};
